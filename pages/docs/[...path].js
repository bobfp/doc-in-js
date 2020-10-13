import { useRouter } from "next/router";

const Post = () => {
  const router = useRouter();
  const { path } = router.query;
  console.log(path);

  return <p>Post: {path} </p>;
};

export default Post;
