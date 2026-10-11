import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// A literal space inside Card reaches LinearGradient's native View. Web can
// render it, but Android throws "Text strings must be rendered within a <Text>".
function bareText(source, filename = "fixture.tsx") {
  const file = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const errors = [];
  function visit(node) {
    const literal =
      (ts.isJsxText(node) && node.getText(file).trim()) ||
      (ts.isJsxExpression(node) &&
        node.expression &&
        (ts.isStringLiteral(node.expression) ||
          ts.isNumericLiteral(node.expression)));
    if (
      literal &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
    ) {
      let parent = node.parent;
      while (ts.isJsxFragment(parent)) parent = parent.parent;
      const tag = parent?.openingElement?.tagName?.getText(file);
      if (!["Text", "Txt"].includes(tag)) {
        errors.push(
          `${filename}:${file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1}`,
        );
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return errors;
}

test("The native text guard catches the reported whitespace regression", () => {
  assert.equal(bareText('<Card><Txt>Ödeme</Txt>{" "}</Card>').length, 1);
  assert.equal(bareText("<View>{0}</View>").length, 1);
  assert.deepEqual(bareText('<Txt>Konum: {" "}{0}</Txt>'), []);
});

test("Application JSX has no literal strings or numbers outside text components", () => {
  const errors = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const filename = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(filename);
      else if (filename.endsWith(".tsx"))
        errors.push(...bareText(fs.readFileSync(filename, "utf8"), filename));
    }
  }
  scan(fileURLToPath(new URL("../src", import.meta.url)));
  assert.deepEqual(errors, []);
});

test("Native map children render zero coordinates as markers, never raw zero text", () => {
  const source = fs.readFileSync(
    new URL("../src/components/MapPanel.tsx", import.meta.url),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (name === "react")
        return {
          createElement: (type, props, ...children) => ({
            type,
            props: props || {},
            children,
          }),
        };
      if (name === "react-native-maps")
        return { __esModule: true, default: "MapView", Marker: "Marker" };
      if (name === "react-native")
        return { View: "View", Linking: { openURL() {} } };
      if (name === "./ui") return { Card: "View", Txt: "Text", Btn: "Button" };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  const business = { latitude: 0, longitude: 0, name: "Örnek işletme" };
  const tree = exports.MapPanel({
    business,
    location: {
      shared: true,
      latitude: 0,
      longitude: 0,
      updated_at: "2026-10-11T12:00:00Z",
    },
  });
  const map = tree.children.find((child) => child?.type === "MapView");
  assert.ok(map);
  assert.equal(
    map.children.filter((child) => child?.type === "Marker").length,
    2,
  );
  assert.equal(map.children[1].props.coordinate.latitude, 0);
  assert.equal(map.children[1].props.coordinate.longitude, 0);
  const missing = exports.MapPanel({
    business: { latitude: null, longitude: null },
  });
  assert.equal(missing.children[0].type, "Text");
});
