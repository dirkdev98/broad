import { promises as fs } from "fs";
import { check, format, Options } from "prettier";

const prettierConfig: Options = {
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
export async function file(filepath: string): Promise<boolean> {
  const config = {
    ...prettierConfig,
    filepath,
  };

  const fileSource = (await fs.readFile(filepath)).toString();
  const isFormatted = check(fileSource, config);

  if (!isFormatted) {
    const formattedSource = format(fileSource, config);
    await fs.writeFile(filepath, formattedSource);
  }

  return isFormatted;
}
