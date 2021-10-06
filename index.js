// install express with `npm install express`
const express = require("express");
const fetch = require("cross-fetch");
const acorn = require("acorn");
const app = express();

app.get("/", (req, res) => {
  res.send(
    '<html><body><p>try <a href="/data.json">/data.json</a> instead</p></body></html>'
  );
});

app.get("/data.json", async (req, res) => {
  const script = await fetch(
    "https://covid.knoxcountytn.gov/js/covid-charts.js"
  );
  if (script.status !== 200) {
    res.send({ errorCode: script.status, text: await body.text() });
    res.statusCode = 500;
    return;
  }
  const ast = acorn.parse(await script.text(), { ecmaVersion: 2020 });
  const data = {};
  for (const { declarations } of ast.body.filter(
    (node) => node.type === "VariableDeclaration"
  )) {
    for (const dec of declarations) {
      if (!dec.init) {
        continue;
      }
      switch (dec.init.type) {
        case "Literal":
          data[dec.id.name] = dec.init.value;
          break;
        case "ArrayExpression":
          data[dec.id.name] = dec.init.elements.map((el) => el && el.value);
          break;
      }
    }
  }

  res.header("Access-Control-Allow-Origin", "*");
  res.send(data);
});

// export 'app'
module.exports = app;
