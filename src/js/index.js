let animeId = null;

export function init() {
  let lastTime = 0;
  let timeLeft = 0;
  const change = 5000;
  const asideContainer = document.querySelector('.wrapper-aside');
  const asideChildren = asideContainer.querySelectorAll('aside');
  const asideDotsBtn = [];

  const createDotsEl = () => {
    const container = document.createElement('ul');
    container.classList.add('dots');
    const elements = () => {
      for (let index = 0; index < asideChildren.length; index++) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        li.classList.add('dots__item');
        button.ariaLabel = `Перейти на слайд номер ${index + 1}`;
        button.classList.add('dots__button');
        button.addEventListener('click', () => {
          disableAnimation();
          asideDotsBtn.forEach(dot => dot.classList.remove('dots__button--active'));
          toGo(index);
        });
        asideDotsBtn.push(button);
        li.append(button)
        container.append(li);
      }
    }; elements();

    asideContainer.append(container);
  }; createDotsEl();

  function doAllTo(pos) {
    for (const el of asideChildren) {
      el.style.transform = (`translateX(${pos}%)`);
    }
  }

  function toAllVisibility() {
    for (const el of asideChildren) {
      el.style.visibility = ('hidden');
      el.style.removeProperty('z-index');
    }
  }

  function removeVisibility(elements) {
    elements.forEach((el) => {
      el.style.removeProperty('visibility');
      el.style.zIndex = ('1');
    });
  }

  function toGo(n) {
    toAllVisibility()
    const currentEl = asideChildren[n];
    const prevEl = n - 1 >= 0 ? asideChildren[n - 1] : null;
    const nextEl = n + 1 <= asideChildren.length - 1 ? asideChildren[n + 1] : null;

    const lastEl = asideChildren[asideChildren.length - 1]
    const firstEl = asideChildren[0]
    if (!prevEl) {
      removeVisibility([currentEl])
      doAllTo(100);
      lastEl.style.transform = ('translateX(-100%)');
      asideDotsBtn[asideDotsBtn.length - 1].classList.remove('dots__button--active');
      currentEl.style.transform = ('translateX(0)');
      asideDotsBtn[n].classList.add('dots__button--active');
      return;
    }
    if (!nextEl) {
      removeVisibility([currentEl]);
      doAllTo(-100);
      firstEl.style.transform = ('translateX(100%)');
      currentEl.style.transform = ('translateX(0)');
      asideDotsBtn[n].classList.add('dots__button--active');
      prevEl.style.transform = ('translateX(-100%)');
      asideDotsBtn[n - 1].classList.remove('dots__button--active');
      return;
    }

    let i = 0;
    doAllTo(100);
    while (true) {
      if (i < n) {
        asideChildren[i].style.transform = ('translateX(-100%)');
      } else {
        break;
      }
      i++
    }

    removeVisibility([currentEl]);
    currentEl.style.transform = ('translateX(0)');
    asideDotsBtn[n].classList.add('dots__button--active');
    asideDotsBtn[n - 1].classList.remove('dots__button--active');
  }

  function anime(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    function slide(timeLeft) {
      if (timeLeft < change * asideChildren.length) {
        toGo(Math.floor(timeLeft / change));
      } else {
        toGo(0);
      }
    }

    if (lastTime === deltaTime) {
      toAllVisibility();
      removeVisibility([asideChildren[0]]);
      animeId = requestAnimationFrame(anime);
      return
    } else {
      timeLeft += deltaTime;

      if (timeLeft > change * asideChildren.length) {
        timeLeft = 0;
      }
      slide(timeLeft);
    }
    animeId = requestAnimationFrame(anime);

  }
  animeId = requestAnimationFrame(anime);


}

export function disableAnimation() {
  cancelAnimationFrame(animeId);
}