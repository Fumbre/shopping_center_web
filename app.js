const express = require('express');
const fs = require("fs").promises;
const path = require('path');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'dist')));

async function getProducts() {
  try {
    const productsPath = path.join(__dirname, 'data', 'products.json');
    const productsData = await fs.readFile(productsPath, 'utf-8');
    return JSON.parse(productsData);
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function getSimilarsItem(currentItem) {
  try {
    const productsPath = path.join(__dirname, 'data', 'products.json');
    const productsData = await fs.readFile(productsPath, 'utf-8');
    const filteredProducts = JSON.parse(productsData)
      .filter(item => item.category === currentItem.category && item.name != currentItem.name)
      .sort((itemA, itemB) => {
        const colorA = itemA.item.additionalInformation.color;
        const colorB = itemB.item.additionalInformation.color;

        const isMatchA = colorA === currentItem.item.additionalInformation.color;
        const isMatchB = colorB === currentItem.item.additionalInformation.color;
        if (isMatchA !== isMatchB) {
          return isMatchB - isMatchA;
        }

        return colorA.localeCompare(colorB);
      })
      .slice(0, 8);
    return filteredProducts;
  } catch (err) {
    console.error(err);
    return null
  }
}

async function getItemByNameAndCategory(name, category, params) {
  const products = await getProducts();
  let isExist = false;
  for (let index = 0; index < products.length; index++) {
    if (products[index][name] === params[0] && products[index][category] === params[1]) {
      isExist = products[index];
      break;
    }
  }
  return isExist;
}

async function getMechanismDesc(mechanismName) {
  try {
    const productHelpPath = path.join(__dirname, 'data', 'productHelp.json');
    const productHelpData = JSON.parse(await fs.readFile(productHelpPath, 'utf-8'));
    return productHelpData.filter(item => item.mechanism === mechanismName);
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getProductsSpecialOffers() {
  try {
    const productsDb = await getProducts();
    return productsDb.filter(item => item.item?.specialOffer === true).sort((a, b) => b.item.rating - a.item.rating)
  } catch (err) {
    return err
  }
}

async function getFilteredProducts(products, queries, howMuch) {
  const sortedProductsDb = [...products];
  console.log(sortedProductsDb);
  if (queries.page) {
    const fromItem = page * howMuch === howMuch ? 0 : (page * howMuch) - howMuch;
    return {
      products: sortedProductsDb.slice(fromItem, page * howMuch),
      page: queries.page,
      // left: 
    };
  }
}

async function getProductsHightRating(howMuch = false) {
  try {
    const productsDb = await getProducts();
    const sortedProductsDb = productsDb.sort((a, b) => b.item?.rating - a.item?.rating);

    return sortedProductsDb.filter((item, index) => {
      if (index < howMuch) {
        return item
      }
      if (howMuch === false) {
        return item
      }
    });

  } catch (err) {
    return err
  }
}

function renderPageNotFound(req, res) {
  const isBot = /bot|crawl|spider/i.test(req.headers['user-agent']);
  if (!isBot && req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return res.status(404).render('dynamic-pug/pageNotFound', { historyLinks: true });
  }
  return res.status(404).render('static-pug/pageNotFound', { historyLinks: true });

}

app.get('/', async (req, res) => {
  const isBot = /bot|crawl|spider/i.test(req.headers['user-agent']);
  const productsDbSpecialOffers = await getProductsSpecialOffers();
  const productsDbHeightRating = await getProductsHightRating(8);
  if (!isBot && req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return res.render('dynamic-pug/main', { productsDbSpecialOffers, productsDbHeightRating });
  }
  return res.render('static-pug/main', { productsDbSpecialOffers, productsDbHeightRating });
});

// app.get("/main", (req, res) => {
//   const isBot = /bot|crawl|spider/i.test(req.headers['user-agent']);
//   if (!isBot && req.headers['x-requested-with'] === 'XMLHttpRequest') {
//     return res.render('dynamic-pug/example', { historyLinks: 'yes it is me' });
//   }
//   return res.render('static-pug/example', { historyLinks: 'is who' });
// });

app.get("/catalog", async (req, res) => {
  const isBot = /bot|crawl|spider/i.test(req.headers['user-agent']);
  const query = parseInt(req.query) | false;
  console.log(req.query);
  const historyLinks = [['/catalog', 'Каталог']];
  const sortedProductsDb = await getProductsHightRating();
  // const test = getFilteredProducts(sortedProductsDb, query, 9);
  if (!isBot && req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return res.render('dynamic-pug/catalog', { historyLinks: historyLinks, sortedProductsDb });
  }

  return res.render('static-pug/catalog', { historyLinks: historyLinks, sortedProductsDb });
})

app.get("/catalog/:category/:id", async (req, res) => {
  const isBot = /bot|crawl|spider/i.test(req.headers['user-agent']);
  const item = await getItemByNameAndCategory('name', 'category', [req.params.id, req.params.category]);
  if (item) {
    const historyLinks = [['/catalog', 'Каталог'], [`/catalog?${item.category}=true`, item.item.additionalInformation.category], [`/catalog/${item.category}/${item.name}`, item.name]];
    const itemMechanism = item.item.additionalInformation.mechanism;
    const [mechanism] = await getMechanismDesc(itemMechanism);
    const similars = await getSimilarsItem(item);
    console.log(similars)
    if (!isBot && req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.render('dynamic-pug/category-item-page', { historyLinks: historyLinks, item, mechanism, similars });
    }

    return res.render('static-pug/category-item-page', { historyLinks: historyLinks, item, mechanism, similars });
  }

  return renderPageNotFound(req, res);
});

app.get("/cooperation", async (req, res) => {
  const isBot = /bot|crawl|spider/i.test(req.headers['user-agent']);
  const historyLinks = [['/cooperation', 'Сотрудничество']];
  if (!isBot && req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return res.render('dynamic-pug/cooperation', { historyLinks: historyLinks });
  }

  return res.render('static-pug/cooperation', { historyLinks: historyLinks });
})

app.get("/contacts", (req, res) => {
  const isBot = /bot|crawl|spider/i.test(req.headers['user-agent']);
  const historyLinks = [['/contacts', 'Контакты']];
  if (!isBot && req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return res.render('dynamic-pug/contacts', { historyLinks: historyLinks });
  }
  return res.render('static-pug/contacts', { historyLinks: historyLinks });
});

app.use((req, res, next) => {
  renderPageNotFound(req, res);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ошибка сервера!');
});

const PORT = process.env.PORT | 3000;

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`)
})