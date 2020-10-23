import { Box } from "rebass";

const MenuItem = (node) => {
  const nodeText = node.path.replace(".json", "");
  return (
    <>
      <Box>
        <a href={"/" + nodeText}>{nodeText}</a>
      </Box>
      {node.children && (
        <Box sx={{ marginLeft: "8px" }}>{node.children.map(MenuItem)}</Box>
      )}
    </>
  );
};

const SideBar = ({ docTree }) => {
  return <Box sx={{ width: "25%" }}>{docTree.map(MenuItem)}</Box>;
};

export default SideBar;
