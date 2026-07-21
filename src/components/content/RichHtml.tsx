function toHtml(value: string) {
  if (value.includes("<")) return value;
  return `<p>${value}</p>`;
}

export function RichHtml({ html }: { html: string }) {
  return (
    <div
      className="space-y-4 text-base leading-relaxed text-ink [&_a]:text-choco [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc"
      dangerouslySetInnerHTML={{ __html: toHtml(html) }}
    />
  );
}
