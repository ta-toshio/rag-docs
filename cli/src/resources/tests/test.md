On this page

Roo Code allows you to create **custom modes** to tailor Roo's behavior to specific tasks or workflows. Custom modes can be either **global** (available across all projects) or **project-specific** (defined within a single project). They allow you to define:

- **A unique name and slug:** For easy identification
- **A role definition:** Placed at the beginning of the system prompt, this defines Roo's core expertise and personality for the mode. This placement is crucial as it shapes Roo's fundamental understanding and approach to tasks
- **Custom instructions:** Added at the end of the system prompt, these provide specific guidelines that modify or refine Roo's behavior. Unlike `.clinerules` files (which only add rules at the end), this structured placement of role and instructions allows for more nuanced control over Roo's responses
- **Allowed tools:** Which Roo Code tools the mode can use (e.g., read files, write files, execute commands)
- **File restrictions:** (Optional) Limit file access to specific file types or patterns (e.g., only allow editing `.md` files)

## Why Use Custom Modes?[​](#why-use-custom-modes "Direct link to Why Use Custom Modes?")

- **Specialization:** Create modes optimized for specific tasks, like "Documentation Writer," "Test Engineer," or "Refactoring Expert"
- **Safety:** Restrict a mode's access to sensitive files or commands. For example, a "Review Mode" could be limited to read-only operations
- **Experimentation:** Safely experiment with different prompts and configurations without affecting other modes
- **Team Collaboration:** Share custom modes with your team to standardize workflows

## Creating Custom Modes[​](#creating-custom-modes "Direct link to Creating Custom Modes")

You have three options for creating custom modes:

### 1\. Ask Roo! (Recommended)[​](#1-ask-roo-recommended "Direct link to 1. Ask Roo! (Recommended)")

You can quickly create a basic custom mode by asking Roo Code to do it for you. For example:

> Create a new mode called "Documentation Writer". It should only be able to read files and write Markdown files.

Roo Code will guide you through the process. However, for fine-tuning modes or making specific adjustments, you'll want to use the Prompts tab or manual configuration methods described below.

### 2\. Using the Prompts Tab[​](#2-using-the-prompts-tab "Direct link to 2. Using the Prompts Tab")

1. **Open Prompts Tab:** Click the icon in the Roo Code top menu bar
2. **Create New Mode:** Click the button to the right of the Modes heading
3. **Fill in Fields:**
    - **Name:** Enter a display name for the mode
    - **Slug:** Enter a lowercase identifier (letters, numbers, and hyphens only)
    - **Save Location:** Choose Global (via `cline_custom_modes.json`, available across all workspaces) or Project-specific (via `.roomodes` file in project root)
    - **Role Definition:** Define Roo's expertise and personality for this mode (appears at the start of the system prompt)
    - **Available Tools:** Select which tools this mode can use
    - **Custom Instructions:** (Optional) Add behavioral guidelines specific to this mode (appears at the end of the system prompt)
4. **Create Mode:** Click the "Create Mode" button to save your new mode

Note: File type restrictions can only be added through manual configuration.

### 3\. Manual Configuration[​](#3-manual-configuration "Direct link to 3. Manual Configuration")

You can configure custom modes by editing JSON files through the Prompts tab:

Both global and project-specific configurations can be edited through the Prompts tab:

1. **Open Prompts Tab:** Click the icon in the Roo Code top menu bar
2. **Access Settings Menu:** Click the button to the right of the Modes heading
3. **Choose Configuration:**
    - Select "Edit Global Modes" to edit `cline_custom_modes.json` (available across all workspaces)
    - Select "Edit Project Modes" to edit `.roomodes` file (in project root)
4. **Edit Configuration:** Modify the JSON file that opens
5. **Save Changes:** Roo Code will automatically detect the changes