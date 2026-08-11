import { PostEditor } from "../PostEditor";
import type { Post } from "../../lib/posts";

export const dynamic = "force-dynamic";

const blank: Post = {
  slug: "",
  title: "",
  dek: "",
  category: "Field Notes",
  date: new Date().toISOString().slice(0, 10),
  cover: "",
  coverAlt: "",
  body: [{ kind: "p", text: "" }],
};

export default function NewPostPage() {
  return <PostEditor initial={blank} isNew />;
}
