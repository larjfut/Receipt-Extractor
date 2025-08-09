module.exports = function () {
  return {
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
          path.replaceWithSourceString('({ env: process.env, url: "http://localhost/" })')
        }
      },
    },
  }
}
