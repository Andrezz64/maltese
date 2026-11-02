import YAML from "yaml";

export interface MatterResult<T = Record<string, any>> {
  data: T;
  content: string;
}

/**
 * Drop-in replacement for gray-matter using the zero-dependency 'yaml' library.
 * Parses YAML frontmatter between '---' markers and returns { data, content }.
 */
export default function matter<T = Record<string, any>>(fileContents: string): MatterResult<T> {
  if (!fileContents) {
    return { data: {} as T, content: "" };
  }

  const match = fileContents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return {
      data: {} as T,
      content: fileContents,
    };
  }

  const rawYaml = match[1];
  const content = match[2];

  let data: T = {} as T;
  try {
    const parsed = YAML.parse(rawYaml);
    if (parsed && typeof parsed === "object") {
      data = parsed as T;
    }
  } catch (err) {
    console.error("[matter] Error parsing YAML frontmatter:", err);
  }

  return {
    data,
    content,
  };
}

export { matter };
