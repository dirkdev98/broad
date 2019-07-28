import { promises as fs } from "fs";

import { format, Options } from "prettier";

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
export async function formatFile(filepath: string): Promise<void> {
  const fileSource = await fs.readFile(filepath);
  const formattedSource = await format(fileSource.toString(), { ...prettierConfig, filepath });
  await fs.writeFile(filepath, formattedSource);
}
