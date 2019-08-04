import { check, format, Options } from "prettier";
import { fs } from "../../pkg";

export interface FormatResult {
  path: string;
  hasChanged: boolean;
}

export const prettierConfig: Options = {
  printWidth: 110,
  tabWidth: 2,
  singleQuote: false,
  bracketSpacing: true,
  trailingComma: "all",
  arrowParens: "avoid",
  semi: true,
  proseWrap: "always",
};

// Formats file with prettier using the following configuration in the prettierConfig variable above
// for more information on configuration see the prettier documentation
// returns false if input has changed
export async function file(filepath: string): Promise<FormatResult> {
  const config = {
    ...prettierConfig,
    filepath,
  };

  const fileSource = await fs.readFile(filepath, "utf-8");
  const isFormatted = check(fileSource, config);

  if (!isFormatted) {
    const formattedSource = format(fileSource, config);
    await fs.writeFile(filepath, formattedSource);
  }

  return {
    path: filepath,
    hasChanged: !isFormatted,
  };
}
