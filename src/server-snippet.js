const parse = require('unfluff');
const req = require('superagent')
const cheerio = require('cheerio')

const ab = "http://www.aftenbladet.no/lokalt/Pass-pa-Det-kan-bli-glatt-mandag-morgen-536428b.html"

const res = await req.get(ab);

console.log(res)
let article = parse.lazy(res.text, 'no')
let articleText = article.text();

if(!articleText){
    // try css extract
    let dom = cheerio.load(res.text);
    articleText = dom('.article-body p').text()
}
                         
const result = {
    title: article.softTitle() || article.title(),
    description: article.description(),
    text: articleText || article.text(),
    date: article.date()
}

console.log(result)