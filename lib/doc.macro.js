const { createMacro } = require("babel-plugin-macros");
const { default: generate } = require("@babel/generator");

let fs = require("fs");

const transformMacro = (ref) => {
  const root = ref.findParent((path) => path.isExpressionStatement());
  root.remove();
};

const writeFile = (file) =>
  fs.writeFile(file.path, file.content, (err) => {
    if (err) throw err;
  });

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

const doc = ({ references, state, babel, config }) => {
  // get all occurances of the macro
  const docs = references.default;

  const docObjects = docs.map((doc) => {
    return {
      templateLiteral: getTemplateLiteral(doc),
      targetDeclaration: getTargetDeclaration(doc),
      passthroughObject: getPassthroughObject(doc),
      filePath: getFilePath(state, config),
    };
  });

  console.log(docObjects);

  // map over to build out block md info
  //const blocks = docs.map((doc) => ({
  //  implicitFields: getImplicitFields(doc, state),
  //  explicitFields: getExplicitFields(doc),
  //}));
  //const fileStrings = blocks.map(generateFileData);

  // write files
  //fileStrings.forEach(writeFile);

  //remove macro from js
  docs.forEach(transformMacro);
};

module.exports = createMacro(doc, {
  configName: "doc-in-js",
});
