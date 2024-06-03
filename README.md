# CLI Tool for Next.js Project Automation

![logo](https://github.com/bipproduction/next-dev/raw/main/assets/logo_next_dev.png)

## Overview

This CLI tool provides automation for common tasks in a Next.js project. It includes commands for generating and clearing `DevBox` components, generating API endpoints, and generating pages. It also ensures the required project structure and configuration files are present.

## Prerequisites

- Ensure you have Node.js installed.
- This tool should be run in the root directory of a Next.js project.

## Installation

### Using Yarn

**Add to project:**
```sh
yarn add next-dev
```

**Global installation:**
```sh
yarn global add next-dev
```

### Using npm

**Add to project:**
```sh
npm i next-dev
```

**Global installation:**
```sh
npm i -g next-dev
```

### Using npx

You can also run the tool directly with `npx`:
```sh
npx next-dev
```

## Usage

This tool provides several commands that can be run using `next-dev`.

### Commands

- **gen-box**: Generates a `DevBox` component around JSX elements in `.tsx` files.
- **clear-box**: Clears `DevBox` components from `.tsx` files.
- **gen-api**: Generates API endpoints.
- **gen-page**: Generates new pages.

### Example Usage

1. **Generate DevBox**:
   ```sh
   next-dev gen-box
   ```

2. **Clear DevBox**:
   ```sh
   next-dev clear-box
   ```

3. **Generate API**:
   ```sh
   next-dev gen-api
   ```

4. **Generate Page**:
   ```sh
   next-dev gen-page
   ```

### Adding `DevBox` Components Automatically

Add `use dev` to the top of the file or below `use client` to automatically generate `DevBox` around the first return element.

Example:
```tsx
return (
    <DevBox path="dnNjb2RlOi8vZmlsZS8vVXNlcnMvYmlwL0RvY3VtZW50cy9wcm9qZWN0cy9iaXAvd2lidS1zZXJ2ZXIvc3JjL3VpL2NvbXBvbmVudC9CdXR0b25Mb2dvdXQudHN4OjE3OjE=">
      <Button
        loading={loading}
        size="compact-sm"
        variant="subtle"
        onClick={logout}
      >
        <Badge>Logout</Badge>
      </Button>
    </DevBox>
);
```

### Toggling Dev Mode with a Button

Call `ButtonToogle` to activate or deactivate dev mode:
```tsx
'use client'
import { Button } from "@mantine/core";
import { ButtonToogle } from "next-dev";

export default function ButtonDev() {
    return <ButtonToogle>
        {(isDev) => <Button size='compact-xs' color={isDev ? "red" : "blue"}>{isDev ? "DEV" : "PROD"}</Button>}
    </ButtonToogle>
}
```

### Options

All commands accept the following option:

- **--log, -l**: Enable logging (default: `false`)

### Example with Options

```sh
next-dev gen-box --log
```

## Script Details

### File Structure and Configuration

1. **Project Root Check**:
   The script checks if it is running in the root directory of a Next.js project by calling `isNextJsRootDir()`. If the check fails, it exits with an error message.

2. **Directory and Configuration File Creation**:
   If the `./src/util` directory does not exist, it creates it. Then, it creates a default configuration file `app_config.ts` if it does not exist.

### Command Definitions

- **gen-box**:
  - Generates `DevBox` components around JSX elements in `.tsx` files.
  - Adds an import statement for `DevBox` if it does not exist.

- **clear-box**:
  - Removes `DevBox` components from `.tsx` files.

- **gen-api**:
  - Generates API endpoint boilerplate.

- **gen-page**:
  - Generates new page boilerplate.

### Error Handling

Each command has a try-catch block to handle errors gracefully and log appropriate error messages.

## Development

### Setup

1. Clone the repository.
2. Run `npm install` to install dependencies.

### Running the CLI

Run the CLI using `next-dev`:

```sh
next-dev <command>
```

### Example Development Flow

1. **Create a New Command**:
   Add a new command to the `yargs` configuration and implement the corresponding function.

2. **Test the Command**:
   Run the command using `next-dev` to ensure it works as expected.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for review.

---

This README provides an overview of the CLI tool, including installation, usage, and development instructions. Make sure to replace `<command>` with the actual command you want to run when using the tool.