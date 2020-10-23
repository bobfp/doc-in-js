import dirTree from "directory-tree";
import { Box } from "rebass";
import SideBar from "../components/SideBar";
import "normalize.css";

export async function getStaticProps() {
  const docTree = dirTree("./docs").children;
  return { props: { docTree } };
}

function HomePage({ docTree }) {
  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex" }}>
      <SideBar docTree={docTree} />
      <Box sx={{ flexGrow: 1 }}>MainContainer</Box>
    </Box>
  );
}

export default HomePage;
