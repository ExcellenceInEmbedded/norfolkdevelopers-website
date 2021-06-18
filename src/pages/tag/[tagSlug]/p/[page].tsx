import siteConfig from "site.config";
import { GetStaticProps } from "next";
import { getTags, getStaticTagPaths } from "src/lib/blog/blog-fns";
import Layout from "src/components/layout/Layout";
import PostCard from "src/components/PostCard";
import PageMeta from "src/components/PageMeta";
import Pagination from "src/components/Pagination";
import { PostData } from "src/DataTypes";

export async function getStaticPaths() {
  if (!siteConfig.features.tagPages) {
    return {
      paths: [],
      fallback: false,
    };
  }

  const posts = getTags();
  const paths = Object.keys(posts)
    .map((tagSlug) => ({
      tagSlug,
      posts: posts[tagSlug],
    }))
    .filter((tag) => tag.posts.length > siteConfig.settings.postsPerPage)
    .map((tag) => {
      let totalPages = Math.ceil(
        tag.posts.length / siteConfig.settings.postsPerPage
      );
      let paginator = new Array(totalPages - 1).fill(null);

      return paginator.map((_, i) => ({
        params: {
          tagSlug: tag.tagSlug,
          page: (i + 2).toString(),
        },
      }));
    })
    .flat();

  return {
    paths,
    fallback: false,
  };
}

type Props = {
  posts: PostData[];
  page: number;
  total: number;
  tagSlug: string;
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const posts = getTags();
  const tagSlug = params?.tagSlug as string;
  const page: number = Number(params?.page || "2");
  const pointer: number = (page - 1) * siteConfig.settings.postsPerPage;

  return {
    props: {
      posts: posts[tagSlug].slice(
        pointer,
        pointer + siteConfig.settings.postsPerPage
      ),
      total: posts[tagSlug].length,
      page,
      tagSlug,
    },
  };
};

export default function TagSlug({ posts, page, total, tagSlug }: Props) {
  return (
    <Layout location="words">
      <PageMeta title={`Posts Tagged: ${tagSlug} (Page: ${page})`} />

      <h1
        className="mt-8 text-3xl font-bold pb-4 lg:max-w-3xl ck
      mr-auto ml-auto"
      >
        <span className="text-red-500 font-bold">/</span>
        tag
        <span className="mx-2 text-red-500 font-bold">/</span>
        {tagSlug}
        <span className="mx-2 text-red-500 font-bold">/</span>
        {page}
      </h1>
      <main className="mt-4 border-gray-600 important:mr-auto important:ml-auto block">
        <ul className="-mx-4">
          {posts.map((post) => (
            <PostCard key={post.path} post={post} />
          ))}
        </ul>

        <Pagination
          root={`/tag/${tagSlug}`}
          seperator={`${tagSlug}/p`}
          page={page}
          total={total}
          perPage={siteConfig.settings.postsPerPage}
        />
      </main>
    </Layout>
  );
}
