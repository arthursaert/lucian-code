import {
  writeFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "fs";
import { join, dirname } from "path";
import { Logger } from "../utils/logger.js";

export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "create_file",
      description:
        "Create a new file with the specified content. Creates parent directories if they do not exist. Overwrites if file exists.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path relative to the working directory",
          },
          content: {
            type: "string",
            description: "The complete file content",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit_file",
      description:
        "Replace the entire content of an existing file. Use this to modify existing files.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to edit",
          },
          content: {
            type: "string",
            description: "The new complete file content",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "replace_in_file",
      description:
        "Replace a specific text pattern in a file with new content. Useful for targeted edits without rewriting the entire file.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to modify",
          },
          oldText: {
            type: "string",
            description: "The exact text to find and replace",
          },
          newText: {
            type: "string",
            description: "The new text to replace with",
          },
        },
        required: ["path", "oldText", "newText"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "insert_at_line",
      description: "Insert new content at a specific line number in a file",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to modify",
          },
          lineNumber: {
            type: "number",
            description: "The line number where to insert (1-based)",
          },
          content: {
            type: "string",
            description: "The content to insert",
          },
        },
        required: ["path", "lineNumber", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_file",
      description: "Delete a file from the filesystem",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to delete",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_directory",
      description:
        "Create a new directory. Creates parent directories if they do not exist.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The directory path relative to the working directory",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List all files and directories in the specified path",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "The directory path to list (default: current directory)",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the content of an existing file",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The file path to read",
          },
        },
        required: ["path"],
      },
    },
  },
];

export class ToolExecutor {
  constructor(workingDir = process.cwd()) {
    this.workingDir = workingDir;
  }

  async execute(toolName, params) {
    Logger.info(`Executing tool: ${toolName}`);

    switch (toolName) {
      case "create_file":
        return await this.createFile(params);
      case "edit_file":
        return await this.editFile(params);
      case "replace_in_file":
        return await this.replaceInFile(params);
      case "insert_at_line":
        return await this.insertAtLine(params);
      case "delete_file":
        return await this.deleteFile(params);
      case "create_directory":
        return await this.createDirectory(params);
      case "list_files":
        return await this.listFiles(params);
      case "read_file":
        return await this.readFile(params);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async createFile(params) {
    const { path, content } = params;
    const fullPath = join(this.workingDir, path);

    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      Logger.info(`Created directory: ${dir}`);
    }

    writeFileSync(fullPath, content, "utf-8");
    Logger.info(`Created file: ${fullPath}`);

    return {
      success: true,
      message: `File created: ${path}`,
      path: fullPath,
    };
  }

  async editFile(params) {
    const { path, content } = params;
    const fullPath = join(this.workingDir, path);

    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${path}`);
    }

    writeFileSync(fullPath, content, "utf-8");
    Logger.info(`Edited file: ${fullPath}`);

    return {
      success: true,
      message: `File edited: ${path}`,
      path: fullPath,
    };
  }

  async replaceInFile(params) {
    const { path, oldText, newText } = params;
    const fullPath = join(this.workingDir, path);

    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${path}`);
    }

    let content = readFileSync(fullPath, "utf-8");

    if (!content.includes(oldText)) {
      throw new Error(`Text pattern not found in file: ${path}`);
    }

    content = content.split(oldText).join(newText);
    writeFileSync(fullPath, content, "utf-8");
    Logger.info(`Replaced text in file: ${fullPath}`);

    return {
      success: true,
      message: `Text replaced in: ${path}`,
      path: fullPath,
    };
  }

  async insertAtLine(params) {
    const { path, lineNumber, content } = params;
    const fullPath = join(this.workingDir, path);

    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${path}`);
    }

    let fileContent = readFileSync(fullPath, "utf-8");
    const lines = fileContent.split("\n");

    if (lineNumber < 1 || lineNumber > lines.length + 1) {
      throw new Error(
        `Invalid line number: ${lineNumber}. File has ${lines.length} lines.`,
      );
    }

    lines.splice(lineNumber - 1, 0, content);
    writeFileSync(fullPath, lines.join("\n"), "utf-8");
    Logger.info(`Inserted content at line ${lineNumber} in: ${fullPath}`);

    return {
      success: true,
      message: `Content inserted at line ${lineNumber} in: ${path}`,
      path: fullPath,
    };
  }

  async deleteFile(params) {
    const { path } = params;
    const fullPath = join(this.workingDir, path);

    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${path}`);
    }

    const { unlinkSync } = await import("fs");
    unlinkSync(fullPath);
    Logger.info(`Deleted file: ${fullPath}`);

    return {
      success: true,
      message: `File deleted: ${path}`,
      path: fullPath,
    };
  }

  async createDirectory(params) {
    const { path } = params;
    const fullPath = join(this.workingDir, path);

    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      Logger.info(`Created directory: ${fullPath}`);
    }

    return {
      success: true,
      message: `Directory created: ${path}`,
      path: fullPath,
    };
  }

  async listFiles(params) {
    const { path = "." } = params;
    const fullPath = join(this.workingDir, path);

    const files = readdirSync(fullPath);

    const result = files.map((file) => {
      const filePath = join(fullPath, file);
      const stats = statSync(filePath);
      return {
        name: file,
        type: stats.isDirectory() ? "directory" : "file",
        size: stats.size,
      };
    });

    return {
      success: true,
      files: result,
    };
  }

  async readFile(params) {
    const { path } = params;
    const fullPath = join(this.workingDir, path);

    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${path}`);
    }

    const content = readFileSync(fullPath, "utf-8");

    return {
      success: true,
      content: content,
      path: fullPath,
    };
  }
}
