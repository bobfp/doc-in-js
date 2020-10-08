const { createMacro } = require("babel-plugin-macros");
const { default: generate } = require("@babel/generator");
const { safeDump } = require("js-yaml");

let fs = require("fs");

const transformMacro = (ref) => {
  const root = ref.findParent((path) => path.isExpressionStatement());
  root.remove();
};

const writeFile = (file) => {
  const appDir = process.cwd();
  fs.mkdirSync(appDir + "/" + file.path, { recursive: true });
  fs.writeFileSync(
    appDir + "/" + file.path + "/" + file.filename,
    file.string,
    (err) => {
      if (err) throw err;
    }
  );
};

const getTemplateLiteral = (babelPath) => {
  const taggedTemplateExpression = babelPath.findParent((path) =>
    path.isTaggedTemplateExpression()
  );
  return taggedTemplateExpression.node.quasi.quasis[0].value.raw;
};

const getVariableName = (variableDeclaration) => {
  return variableDeclaration.node.declarations[0].id.name;
};

const getFunctionName = (functionDeclaration) => {
  return functionDeclaration.node.id.name;
};

const getTargetDeclaration = (babelPath) => {
  const parentExpressionStatement = babelPath.findParent((path) =>
    path.isExpressionStatement()
  );
  const parentKey = parentExpressionStatement.key;
  const nextDeclaration = parentExpressionStatement.getSibling(parentKey + 1);
  return nextDeclaration.type === "VariableDeclaration"
    ? getVariableName(nextDeclaration)
    : getFunctionName(nextDeclaration);
};

const getPassthroughObject = (babelPath) => {
  const objectExpression = babelPath.findParent((path) =>
    path.isCallExpression()
  ).node.arguments[0];
  return objectExpression ? eval(`(${generate(objectExpression).code})`) : null;
};

const getFilePath = (state) => {
  return state.file.opts.sourceFileName;
};

const convertToMarkdown = (config) => (docObject) => {
  const frontmatter = docObject.data
    ? safeDump(docObject.data, { skipInvalid: true })
    : null;
  const content = docObject.content;
  const [_, ...tailPath] = docObject.srcPath.replace(".js", "").split("/");
  const rawPath = [config.dir, ...tailPath];
  const path =
    rawPath[rawPath.length - 1] === "index"
      ? rawPath.slice(0, -1).join("/")
      : rawPath.join("/");
  const filename = docObject.name.concat(".md");

  return {
    string: frontmatter ? `---\n${frontmatter}\n---\n${content}` : content,
    path,
    filename,
  };
};

const doc = ({ references, state, babel, config }) => {
  // get all occurances of the macro
  const docs = references.default;

  const docObjects = docs.map((doc) => {
    const data = getPassthroughObject(doc);
    return {
      content: getTemplateLiteral(doc),
      name: (data && data.name) || getTargetDeclaration(doc),
      data,
      srcPath: getFilePath(state, config),
    };
  });

  //const applyPlugins = docObjects.map(plugins(config)); //TODO

  const markdownFiles = docObjects.map(convertToMarkdown(config));
  markdownFiles.forEach(writeFile);

  //remove macro from js
  docs.forEach(transformMacro);
};

module.exports = createMacro(doc, {
  configName: "doc-in-js",
});
