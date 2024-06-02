const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require('fs')

const code = `
import {MdSearch, MdRestartAlt, MdDeveloperBoard} from "react-icons/md";
export default function Apa(){

    function Itu(){
        return (
            <p>didalam itu</p>
        )
    }

    function Ada(){
      return (
          <div>didalam ada</div>
      )
  }

    return (
        <Stack>
          main didalam stak 
          <Text>didalam text</Text>
        </Stack>
      );
  }
`;

// Parse code into AST
const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["jsx"]
});

// Traverse the AST to find JSX elements
const elements = [];

traverse(ast, {
  ExportDefaultDeclaration(path) {
    path.traverse({
      ReturnStatement(path) {
        path.traverse({
          JSXElement(path) {
            elements.push(path.node);
          },
        });
      },
    });
  },
  
});

fs.writeFileSync('components.json', JSON.stringify(elements, null, 2))
console.log("success")