const SERVER = window.location;
const currentPath = new URL(SERVER.href).pathname;

document.addEventListener("DOMContentLoaded", () => {
  const textMain = document.getElementById('main').innerHTML;
  historyState(textMain, SERVER);
  scriptHandlers(currentPath);
});

window.addEventListener("popstate", (event) => {
  if (event.state) {
    const storedData = event.state.state;

    const main = document.getElementById('main');
    main.innerHTML = storedData;
    scriptHandlers(new URL(SERVER.href).pathname, main);
  } else {
    console.log('No state found');
  }
})

const req = (url) => fetch(`${url}`, {
  headers: {
    'x-requested-with': 'XMLHttpRequest'
  },
}).then((res) => {
  return res.text();
});

const historyState = (state, url) => {
  const htmlContent = { state };
  history.pushState(htmlContent, '', `${url}`);
}

let prevScriptPath = '';

const scriptHandlers = (url, container = false) => {

  if (prevScriptPath) {
    prevScriptPath(false); // disable prev script
  }

  const pathes = {
    '/': async (enable = true) => {
      const index = await import('./index.js');
      if (enable) {
        index.init()
      } else {
        index.disableAnimation();
      }
    },
    '/main': async (enable = true) => {
      const module = await import('./test.js');
      module.init();
    },
  };

  if (pathes[url]) {
    pathes[url]().then(() => {
      attachDynamikLinkListener(container);
    });
    prevScriptPath = pathes[url];
  } else {
    attachDynamikLinkListener(container);
  }
  console.log(url);
}

function attachDynamikLinkListener(container = false) {
  const doc = !container ? document : container;
  doc.querySelectorAll('a.dynamic-link').forEach((link) => {
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      const a = event.currentTarget;
      console.log(a.href);
      const textHtml = await req(a.href);

      const relativePath = new URL(a.href, SERVER.origin).pathname;
      const main = document.getElementById('main');

      historyState(textHtml, relativePath);
      console.log(main)
      window.scrollTo({
        top: 0,
      });
      main.innerHTML = textHtml;

      scriptHandlers(relativePath, main);
    });
  });
}

export const router = { currentPath }