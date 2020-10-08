import doc from "../../lib/doc.macro";

doc({ name: "index" })`
# User Module
=====
This module is to store user functions
`;

doc({ a: "cat", b: "dog" })`
# Add
=====

Adds two numbers together
`;
const add = (n1, n2) => n1 + n2;

doc()`
# Add1
=====

Adds one to a number
`;
function add1(n1) {
  n1 + 1;
}
