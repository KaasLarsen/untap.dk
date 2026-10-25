type ArticleBodyProps = {
  html: string;
};

export function ArticleBody({ html }: ArticleBodyProps) {
  return (
    <div
      className="prose-untap"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
