import { useRouter } from "next/router";
import dirTree from "directory-tree";
import fs from "fs";
import nodePath from "path";
import ReactMarkdown from "react-markdown";
import SideBar from "../../components/SideBar";
import { Box } from "rebass";

const flattenPaths = (paths = []) => {
  return paths.reduce((final, path) => {
    return [...final, path, ...flattenPaths(path.children)];
  }, []);
};

export async function getStaticProps({ params }) {
  const docTree = dirTree("./docs").children;
  const jsonFile = nodePath.join(
    process.cwd(),
    "docs/" + params.path.join("/") + ".json"
  );
  let docObjects;
  try {
    docObjects = fs.readFileSync(jsonFile, "utf8");
  } catch {
    docObjects = fs.readFileSync(
      jsonFile.replace(".json", "/index.json"),
      "utf8"
    );
  }
  return {
    props: { docObjects: JSON.parse(docObjects), docTree }, // will be passed to the page component as props
  };
}

export async function getStaticPaths() {
  const nestedPaths = dirTree("./docs").children;
  const flatPaths = flattenPaths(nestedPaths)
    .filter(({ type }) => type !== "directory")
    .map((path) => {
      return `/${path.path.replace("/index.json", "").replace(".json", "")}`;
    });
  return {
    paths: flatPaths,
    fallback: true,
  };
}

const Post = ({ docObjects, docTree }) => {
  const router = useRouter();
  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex" }}>
      <SideBar docTree={docTree} />
      <Box sx={{ flexGrow: 1 }}>
        {docObjects.map((docObject, i) => {
          return <ReactMarkdown key={i} source={docObject.content} />;
        })}
      </Box>
    </Box>
  );
};

export default Post;
