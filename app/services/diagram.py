# import logging
# import re
# import json
# import requests
# from pathlib import Path
# from typing import Dict, Any, Optional, List
# import base64
# from app.config import LLMConfig, DiagramConfig
# from app.utils.helpers import create_unique_filename, save_to_file
# from app.renderers import get_renderer

# class DiagramGenerator:
#     """
#     Service for generating architecture diagrams from codebase summaries.
#     """
    
#     # System prompt for diagram generation (preserved from original)
#     DIAGRAM_SYSTEM_PROMPT = """You are a diagram code generation assistant. Your task is to generate valid and accurate diagram code in the requested format, based solely on the provided prompts.

# ### Guidelines:

# - **Do not include any explanations, comments, annotations, or additional text**; output only the diagram code.
# - **Ensure the diagram code is syntactically correct** and adheres to the standards of the specified diagram language.
# - **Focus on accurately representing** the provided summary or instructions in the diagram code.
# - **Use appropriate syntax and conventions** for the specified diagram language.
# - **Avoid special characters** in labels; use only alphanumeric characters and underscores.
# - **Do not include file extensions, function parameters, or specific implementation details** unless explicitly requested.
# - **Provide only the raw diagram code**, without wrapping it in markdown or code blocks.
# - **Do not include code block markers such as ``` or :::**
# - **Do not include any explanations, comments, annotations, or any text before or after the diagram code.**
# - **Do not include comments within the code unless they are necessary for the diagram syntax.**
# """

#     # Mermaid diagram prompt template (preserved from original)
#     MERMAID_PROMPT_TEMPLATE = """**Objective:**

# Based on the provided codebase summary, generate a concise and professional **Mermaid flowchart** that visually represents the system's architecture, major components, and data flow. Focus on:

# - **Logical grouping of components** (e.g., services, databases, external APIs)
# - **Interactions** between components and external systems
# - **Data flow** between major components

# **Instructions:**

# - **Use a left-to-right flowchart layout** with inputs (e.g., users) on the left and external systems on the right.
# - **Group related components** using subgraphs.
# - **Label nodes and edges clearly**, using simple and descriptive names.
# - **Avoid special characters**, function names with arguments, parentheses, quotation marks, or any code-specific details in labels.
# - **Use only alphanumeric characters and underscores** in labels.
# - **Represent external systems distinctly**, and encapsulate all internal components within a grouping named after the codebase.
# - **Apply minimal colors** to differentiate logical groupings without overwhelming the diagram.
# - **Ensure Mermaid syntax is correct** and the diagram can be rendered without errors.
# - **Do not include any additional text** beyond the Mermaid code.
# - **Do not include code block markers such as ```mermaid, ```, :::mermaid, or :::; provide only the raw Mermaid code**
# - **Do not include any explanations, annotations, or text outside the Mermaid code.**
# - **Provide only the Mermaid code, without any additional text before or after it.**
# - **Do not include comments within the code unless they are necessary for the Mermaid syntax.**

# ### Example Mermaid Flowchart Syntax:

# graph LR
#     User[User] --> UI[User_Interface]

#     subgraph Codebase
#         UI --> Backend[Backend_Service]
#         Backend --> API[External_API]
#     end

#     subgraph External_Systems
#         Backend --> DB[Database]
#         API --> ThirdParty[Third_Party_System]
#     end

# This is an example flowchart illustrating a basic system layout, which includes nodes, edges, subgraphs, and external systems.
# ---
# **Input:**  
# - Codebase summary: {combined_summary}

# **Your Task:**  
# Generate valid Mermaid code that illustrates the system's architecture and data flows based on the provided summary. Output only the Mermaid code.
# """

#     # PlantUML diagram prompt template (preserved from original)
#     PLANTUML_PROMPT_TEMPLATE = """**Objective:**

# Based on the provided codebase summary, generate a concise and professional **PlantUML diagram** that visually represents the system's architecture, major components, and data flow. Focus on:

# - **Logical grouping of components** (e.g., services, databases, APIs)
# - **Key interactions** between components and external systems
# - **Data flow** between major components

# **Instructions:**

# - **Use a left-to-right layout** with inputs (e.g., users) on the left and external systems on the right.
# - **Group related components** using boundaries or packages.
# - **Label nodes and edges clearly**, avoiding special characters and using alphanumeric characters and underscores.
# - **Represent external dependencies distinctly**, using appropriate stereotypes or icons.
# - **Encapsulate internal components** within a boundary named after the system.
# - **Include the user** as an actor interacting with the system.
# - **Apply minimal colors** to differentiate logical groupings without overwhelming the diagram.
# - **Avoid mentioning file extensions, function parameters, parentheses, or quotation marks**.
# - **Ensure PlantUML syntax is correct** and the diagram can be rendered without errors.
# - **Do not include any additional text** beyond the PlantUML code.
# - **Do not include code block markers such as ```plantuml, ```, @startuml, @enduml; provide only the raw PlantUML code**

# ---

# **Input:**  
# - Codebase summary: {combined_summary}

# **Your Task:**  
# Generate valid PlantUML code that illustrates the system's architecture and data flows based on the provided summary. Output only the PlantUML code."""

#     def __init__(self, output_dir: Path, diagram_type: str = None):
#         """
#         Initialize the diagram generator.
        
#         Args:
#             output_dir: Directory where diagrams will be saved
#             diagram_type: Type of diagram to generate (default from config if None)
#         """
#         self.output_dir = output_dir
#         self.diagram_type = diagram_type or DiagramConfig.DEFAULT_DIAGRAM_TYPE
        
#         # Ensure output directory exists
#         self.output_dir.mkdir(parents=True, exist_ok=True)
        
#         logging.info(f"Initialized diagram generator for {diagram_type} diagrams")
    
#     def generate_diagrams(self, codebase_summary: str) -> Dict[str, Any]:
#         """
#         Generate architecture diagrams based on the codebase summary.
        
#         Args:
#             codebase_summary: Summary of the codebase
            
#         Returns:
#             Dictionary containing diagram information
#         """
#         logging.info(f"Generating {self.diagram_type} diagrams")
        
#         # Create prompt for diagram generation
#         prompt = self._create_diagram_prompt(codebase_summary)
        
#         # Save the prompt
#         prompt_path = self.output_dir / f"{self.diagram_type}_prompt.txt"
#         save_to_file(prompt, prompt_path)
        
#         diagrams = {}
        
#         # Generate diagrams
#         try:
#             # Generate low-level diagram
#             low_level_result = self._generate_low_level_diagram(prompt)
#             if low_level_result["diagram_path"]:
#                 with open(low_level_result["diagram_path"], "rb") as img_file:
#                     base64_image = base64.b64encode(img_file.read()).decode("utf-8")
#                 low_level_result["diagram_base64"] = base64_image  
#             diagrams["low_level"] = low_level_result
            
#             # Generate high-level diagram
#             high_level_result = self._generate_high_level_diagram(prompt)
#             if high_level_result["diagram_path"]:
#                 with open(high_level_result["diagram_path"], "rb") as img_file:
#                     base64_image = base64.b64encode(img_file.read()).decode("utf-8")
#                 high_level_result["diagram_base64"] = base64_image  # Store Base64 data
#             diagrams["high_level"] = high_level_result
            
#             logging.info("Diagram generation complete")
            
#         except Exception as e:
#             logging.error(f"Error generating diagrams: {e}")
#             diagrams["error"] = str(e)
        
#         return diagrams
    
#     def _create_diagram_prompt(self, codebase_summary: str) -> str:
#         """
#         Create a prompt for diagram generation based on diagram type.
        
#         Args:
#             codebase_summary: Summary of the codebase
            
#         Returns:
#             Prompt text for diagram generation
#         """
#         if self.diagram_type.lower() == "mermaid":
#             return self.MERMAID_PROMPT_TEMPLATE.format(combined_summary=codebase_summary)
#         elif self.diagram_type.lower() == "plantuml":
#             return self.PLANTUML_PROMPT_TEMPLATE.format(combined_summary=codebase_summary)
#         else:
#             raise ValueError(f"Unsupported diagram type: {self.diagram_type}")
    
#     def _generate_low_level_diagram(self, prompt: str) -> Dict[str, Any]:
#         """
#         Generate a low-level architecture diagram using OpenAI API.
        
#         Args:
#             prompt: Prompt for diagram generation
            
#         Returns:
#             Dictionary containing diagram information
#         """
#         logging.info("Generating low-level architecture diagram")
        
#         try:
#             # Call OpenAI API
#             diagram_code = self._call_openai_api(
#                 # prompt=f"Generate a detailed low-level architecture diagram using {self.diagram_type}. It must be as detailed as required for a low-level architecture you must generate high quality diagram without any compromise in quality and content. Must be very easily understandable. Mark and show all the available components without leaving or skipping the components and their relations.\n\n{prompt}")
#                 prompt=f"""You are an expert software engineer tasked with analyzing a codebase to generate detailed low-level architecture diagrams. Based on the code provided below, create detailed class hierarchies and function call graphs.

# TASK:
# 1. Analyze the provided code to identify:
#    - Class definitions and their relationships (inheritance, composition, implementation)
#    - Function/method definitions and their call patterns
#    - Important interfaces and abstract classes
#    - Key data structures and their usage

# 2. Create TWO separate Mermaid diagrams:
   
#    A. CLASS HIERARCHY DIAGRAM showing:
#       - All classes and their inheritance relationships
#       - Interface implementations
#       - Composition relationships
#       - Important properties and methods
   
#    B. FUNCTION CALL GRAPH showing:
#       - Key functions/methods
#       - Call relationships between functions
#       - Direction of calls
#       - Entry points and terminators

# OUTPUT REQUIREMENTS:
# 1. Use Mermaid.js classDiagram syntax for the class hierarchy
# 2. Use Mermaid.js flowchart or graph syntax for function call graphs
# 3. For the class diagram:
#    - Show inheritance with arrows
#    - Show composition with diamond-ended arrows
#    - Include important methods and properties
#    - Use different colors for abstract vs concrete classes
# 4. For the function call graph:
#    - Use directional arrows to show call direction
#    - Group functions by class/module where appropriate
#    - Use different node styles for public vs private methods
# 5. Add appropriate styling to improve readability
# 6. Include brief notes explaining complex relationships

# ADDITIONAL GUIDELINES:
# - Focus on the most important classes and functions - you don't need to include every detail
# - For large codebases, focus on a specific subsystem or component
# - Use appropriate Mermaid syntax for each diagram type
# - Ensure diagrams are well-organized with minimal crossing lines
# - Add a brief description of key patterns or design principles observed

# Here is the code to analyze:

# {prompt}

# Your output should include both diagrams with brief explanations of what they show.""")
#             # Clean the diagram code
#             diagram_code = self._clean_diagram_code(diagram_code)
            
#             # Save the diagram code
#             code_path = self.output_dir / f"{self.diagram_type}_low_level_diagram.txt"
#             save_to_file(diagram_code, code_path)
            
#             # Render the diagram
#             diagram_path = self._render_diagram(diagram_code, "low_level")
            
#             return {
#                 "code": diagram_code,
#                 "code_path": str(code_path),
#                 "diagram_path": str(diagram_path) if diagram_path else None
#             }
            
#         except Exception as e:
#             logging.error(f"Error generating low-level diagram: {e}")
#             return {"error": str(e)}
    
#     def _generate_high_level_diagram(self, prompt: str) -> Dict[str, Any]:
#         """
#         Generate a high-level architecture diagram using OpenAI API.
        
#         Args:
#             prompt: Prompt for diagram generation
            
#         Returns:
#             Dictionary containing diagram information
#         """
#         logging.info("Generating high-level architecture diagram")
        
#         try:
#             # Call OpenAI API
#             diagram_code = self._call_openai_api(
#                 # prompt=f"Generate a detailed high-level architecture diagram using {self.diagram_type} with each and every component explained in detailed.\n\n{prompt}")
#                 prompt=f"""You are an expert software architect tasked with analyzing a codebase to generate a high-level system architecture diagram. Based on the code summary provided below, create a comprehensive system architecture and dependency visualization.

# TASK:
# 1. Analyze the provided code summary to identify key components, services, modules, and their relationships.
# 2. Create a Mermaid flowchart diagram that shows:
#    - Main system components (services, modules, controllers, etc.)
#    - Interactions and dependencies between components (API calls, imports, data flow)
#    - External services or dependencies
#    - Data stores and their connections to services
#    - Clear direction of data flow and control
   
# OUTPUT REQUIREMENTS:
# 1. Use Mermaid.js flowchart or graph syntax (flowchart TD or LR preferred)
# 2. Group related components using subgraph where appropriate
# 3. Use different node shapes or colors to distinguish between component types:
#    - Services/Controllers (rectangle)
#    - Data stores (cylinder)
#    - External dependencies (cloud)
#    - Utilities/Helpers (circle)
# 4. Include a brief legend explaining the diagram symbols
# 5. Add concise notes to any complex interactions
# 6. Provide a clear, well-organized layout that minimizes crossing lines
# 7. Add styling to improve readability (colors, borders, etc.)

# ADDITIONAL GUIDELINES:
# - Focus on macro-level architecture, not individual functions or methods
# - Prioritize clarity over completeness - show key relationships, not every minor connection
# - If the codebase is large, focus on the most important subsystems
# - Add a brief textual description of the overall system architecture above the diagram

# Here is the code summary to analyze:

# {prompt}

# Your output should ONLY include the Mermaid diagram and a brief system description, formatted to be easily rendered.""")
#             # Clean the diagram code
#             diagram_code = self._clean_diagram_code(diagram_code)
            
#             # Save the diagram code
#             code_path = self.output_dir / f"{self.diagram_type}_high_level_diagram.txt"
#             save_to_file(diagram_code, code_path)
            
#             # Render the diagram
#             diagram_path = self._render_diagram(diagram_code, "high_level")
            
#             return {
#                 "code": diagram_code,
#                 "code_path": str(code_path),
#                 "diagram_path": str(diagram_path) if diagram_path else None
#             }
            
#         except Exception as e:
#             logging.error(f"Error generating high-level diagram: {e}")
#             return {"error": str(e)}
    
#     def _clean_diagram_code(self, diagram_code: str) -> str:
#         """
#         Clean the diagram code by removing code block markers and extra text.
        
#         Args:
#             diagram_code: Raw diagram code from LLM
            
#         Returns:
#             Cleaned diagram code
#         """
#         # Build a regex pattern to match code block markers
#         diagram_type = self.diagram_type.lower()
#         block_marker_pattern = rf'```(?:{diagram_type})?\s*\n|```|:::(?:{diagram_type})?\s*\n|:::'
        
#         # Remove code block markers
#         cleaned_code = re.sub(block_marker_pattern, '', diagram_code, flags=re.MULTILINE)
        
#         # Remove leading and trailing whitespace
#         cleaned_code = cleaned_code.strip()
        
#         # For Mermaid, ensure it starts with graph definition
#         if diagram_type == "mermaid" and not cleaned_code.strip().startswith(('graph ', 'flowchart ')):
#             cleaned_code = "graph LR\n" + cleaned_code
        
#         return cleaned_code
    
#     def _render_diagram(self, diagram_code: str, diagram_level: str) -> Optional[Path]:
#         """
#         Render the diagram code to an image file.
        
#         Args:
#             diagram_code: Diagram code to render
#             diagram_level: Level of the diagram (high_level or low_level)
            
#         Returns:
#             Path to the rendered image file, or None if rendering failed
#         """
#         try:
#             renderer = get_renderer(self.diagram_type)
            
#             # Attempt to render the diagram
#             success = False
#             error_messages = []
#             diagram_codes = [diagram_code]
            
#             for attempt in range(LLMConfig.MAX_FIX_ATTEMPTS):
#                 try:
#                     logging.info(f"Rendering attempt {attempt+1} for {diagram_level} diagram")
                    
#                     # Generate the diagram
#                     png_path = renderer.generate_png(diagram_codes[-1], self.output_dir)
                    
#                     if png_path:
#                         # Rename with the diagram level
#                         new_path = png_path.parent / f"{png_path.stem}_{diagram_level}{png_path.suffix}"
#                         png_path.rename(new_path)
#                         png_path = new_path
                        
#                         logging.info(f"Successfully rendered {diagram_level} diagram to {png_path}")
#                         return png_path
#                     else:
#                         raise Exception("Rendering returned no PNG filepath")
                        
#                 except Exception as e:
#                     error_message = str(e)
#                     logging.error(f"Error rendering {diagram_level} diagram (attempt {attempt+1}): {error_message}")
#                     error_messages.append(error_message)
                    
#                     if attempt < LLMConfig.MAX_FIX_ATTEMPTS - 1:
#                         # Try to fix the diagram code
#                         fixed_code = self._fix_diagram_code(diagram_codes[-1], error_message)
#                         diagram_codes.append(fixed_code)
                        
#                         # Save the fixed code
#                         fixed_code_path = self.output_dir / f"{self.diagram_type}_{diagram_level}_diagram_fixed_attempt_{attempt+1}.txt"
#                         save_to_file(fixed_code, fixed_code_path)
            
#             logging.error(f"Failed to render {diagram_level} diagram after {LLMConfig.MAX_FIX_ATTEMPTS} attempts")
#             return None
            
#         except Exception as e:
#             logging.error(f"Error in _render_diagram: {e}")
#             return None
    
#     def _fix_diagram_code(self, diagram_code: str, error_message: str) -> str:
#         """
#         Use LLM to fix diagram code based on error message.
        
#         Args:
#             diagram_code: Original diagram code that caused the error
#             error_message: Error message from the renderer
            
#         Returns:
#             Fixed diagram code
#         """
#         # Create prompt for fixing diagram code
#         prompt_template = """**Objective:**

# Based on the provided diagram code and the error message, fix the diagram code so that it renders correctly.

# **Instructions:**

# - Review the error message and the diagram code.
# - Correct any syntax errors or issues that prevent the diagram from rendering.
# - **Do not include function parameters, parentheses, or quotation marks in node labels.**
# - **Avoid using function names with arguments or code-specific details in the labels.**
# - Ensure the corrected diagram code is valid and can be rendered without errors.
# - Output only the corrected diagram code.
# - **Do not include code block markers such as \`\`\` or :::**
# - **Do not include any explanations, comments, annotations, or any text before or after the diagram code.**
# - **Provide only the corrected diagram code.**

# **IMPORTANT SYNTAX REQUIREMENTS:**
# 1. Mermaid diagrams MUST start with 'graph LR' or 'graph TD' on the first line.
# 2. Each node must have a unique ID and a valid label format like 'ID[Label]'.
# 3. Connections must use '-->' syntax between valid node IDs.
# 4. Subgraphs must start with 'subgraph Title' and end with 'end'.
# 5. Avoid special characters in node IDs or labels.
# 6. Keep the diagram simple, with 10-15 nodes maximum.

# ---

# **Input:**
# - Diagram code:
# {diagram_code}

# - Error message:
# {error_message}

# **Your Task:**
# Provide the corrected diagram code that will render properly.
# """
        
#         prompt = prompt_template.format(diagram_code=diagram_code, error_message=error_message)
        
#         # Use the LLM to generate the fixed diagram code
#         fixed_code = self._call_llm_api(prompt)
        
#         # Clean the fixed diagram code
#         return self._clean_diagram_code(fixed_code)
    
#     def _call_llm_api(self, prompt: str) -> str:
#         """
#         Call the local LLM API to generate diagram code.
        
#         Args:
#             prompt: Prompt text
            
#         Returns:
#             Generated diagram code
#         """
#         try:
#             import requests
#             import json
            
#             payload = {
#                 "model": LLMConfig.DIAGRAM_MODEL,
#                 "prompt": prompt,
#                 "system": self.DIAGRAM_SYSTEM_PROMPT
#             }
            
#             headers = {'Content-Type': 'application/json'}
#             response = requests.post(
#                 LLMConfig.LLM_API_URL,
#                 data=json.dumps(payload),
#                 headers=headers,
#                 stream=True
#             )
            
#             if response.status_code != 200:
#                 logging.error(f"LLM API error: {response.status_code}")
#                 return ""
            
#             # Read streaming response
#             response_content = ""
#             for line in response.iter_lines():
#                 if line:
#                     try:
#                         data = json.loads(line.decode('utf-8'))
#                         if 'response' in data:
#                             response_content += data['response']
#                         if data.get('done', False):
#                             break
#                     except json.JSONDecodeError as e:
#                         logging.error(f"JSON decode error: {e}")
#                         continue
            
#             return response_content
            
#         except Exception as e:
#             logging.error(f"Error calling LLM API: {e}")
#             return ""
    
#     def _call_gemini_api(self, prompt: str) -> str:
#         try:
#             headers = {
#                 "Content-Type": "application/json",
#                 "Authorization": f"Bearer {LLMConfig.GEMINI_API_KEY}"
#             }

#             payload = {
#                 "model": "gemini-pro",
#                 "messages": [
#                     {"role": "system", "content": self.DIAGRAM_SYSTEM_PROMPT},
#                     {"role": "user", "content": prompt}
#                 ],
#                 "temperature": 0.7
#             }

#             response = requests.post(
#                 "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
#                 headers=headers,
#                 json=payload
#             )

#             if response.status_code != 200:
#                 logging.error(f"Gemini API error: {response.status_code} - {response.text}")
#                 return ""

#             result = response.json()
#             diagram_code = result.get("choices", [{}])[0].get("message", {}).get("content", "")

#             return diagram_code

#         except Exception as e:
#             logging.error(f"Error calling Gemini API: {e}")
#             return ""
        
#     def _call_openai_api(self, prompt: str) -> str:
#         """
#         Call the OpenAI API to generate diagram code.
        
#         Args:
#             prompt: Prompt text
            
#         Returns:
#             Generated diagram code
#         """
#         try:
#             headers = {
#                 "Content-Type": "application/json",
#                 "Authorization": f"Bearer {LLMConfig.OPENAI_API_KEY}"
#             }
            
#             payload = {
#                 "model": "gpt-4",  # or your preferred OpenAI model
#                 "messages": [
#                     {"role": "system", "content": self.DIAGRAM_SYSTEM_PROMPT},
#                     {"role": "user", "content": prompt}
#                 ],
#                 "temperature": 0.7
#             }
            
#             response = requests.post(
#                 "https://api.openai.com/v1/chat/completions",
#                 headers=headers,
#                 json=payload
#             )
            
#             if response.status_code != 200:
#                 logging.error(f"OpenAI API error: {response.status_code} - {response.text}")
#                 return ""
                
#             result = response.json()
#             diagram_code = result["choices"][0]["message"]["content"]
            
#             return diagram_code
            
#         except Exception as e:
#             logging.error(f"Error calling OpenAI API: {e}")
#             return ""
import logging
import re
import json
import requests
from pathlib import Path
from typing import Dict, Any, Optional, List
import base64
from app.config import LLMConfig, DiagramConfig
from app.utils.helpers import create_unique_filename, save_to_file
from app.renderers import get_renderer

class DiagramGenerator:
    """
    Service for generating architecture diagrams from codebase summaries.
    """
    
    # System prompt for diagram generation
    DIAGRAM_SYSTEM_PROMPT = """You are a diagram code generation assistant. Your task is to generate valid and accurate diagram code in the requested format, based solely on the provided prompts.

### Guidelines:

- **Do not include any explanations, comments, annotations, or additional text**; output only the diagram code.
- **Ensure the diagram code is syntactically correct** and adheres to the standards of the specified diagram language.
- **Focus on accurately representing** the provided summary or instructions in the diagram code.
- **Use appropriate syntax and conventions** for the specified diagram language.
- **Avoid special characters** in labels; use only alphanumeric characters and underscores.
- **Do not include file extensions, function parameters, or specific implementation details** unless explicitly requested.
- **Provide only the raw diagram code**, without wrapping it in markdown or code blocks.
- **Do not include code block markers such as ``` or :::**
- **Do not include any explanations, comments, annotations, or any text before or after the diagram code.**
- **Do not include comments within the code unless they are necessary for the diagram syntax.**
"""

    # Mermaid diagram prompt template
    MERMAID_PROMPT_TEMPLATE = """**Objective:**

Based on the provided codebase summary, generate a concise and professional **Mermaid flowchart** that visually represents the system's architecture, major components, and data flow. Focus on:

- **Logical grouping of components** (e.g., services, databases, external APIs)
- **Interactions** between components and external systems
- **Data flow** between major components

**Instructions:**

- **Use a left-to-right flowchart layout** with inputs (e.g., users) on the left and external systems on the right.
- **Group related components** using subgraphs.
- **Label nodes and edges clearly**, using simple and descriptive names.
- **Avoid special characters**, function names with arguments, parentheses, quotation marks, or any code-specific details in labels.
- **Use only alphanumeric characters and underscores** in labels.
- **Represent external systems distinctly**, and encapsulate all internal components within a grouping named after the codebase.
- **Apply minimal colors** to differentiate logical groupings without overwhelming the diagram.
- **Ensure Mermaid syntax is correct** and the diagram can be rendered without errors.
- **Do not include any additional text** beyond the Mermaid code.
- **Do not include code block markers such as ```mermaid, ```, :::mermaid, or :::; provide only the raw Mermaid code**
- **Do not include any explanations, annotations, or text outside the Mermaid code.**
- **Provide only the Mermaid code, without any additional text before or after it.**
- **Do not include comments within the code unless they are necessary for the Mermaid syntax.**

### Example Mermaid Flowchart Syntax:

graph LR
    User[User] --> UI[User_Interface]

    subgraph Codebase
        UI --> Backend[Backend_Service]
        Backend --> API[External_API]
    end

    subgraph External_Systems
        Backend --> DB[Database]
        API --> ThirdParty[Third_Party_System]
    end

This is an example flowchart illustrating a basic system layout, which includes nodes, edges, subgraphs, and external systems.
---
**Input:**  
- Codebase summary: {combined_summary}

**Your Task:**  
Generate valid Mermaid code that illustrates the system's architecture and data flows based on the provided summary. Output only the Mermaid code.
"""

    # PlantUML diagram prompt template
    PLANTUML_PROMPT_TEMPLATE = """**Objective:**

Based on the provided codebase summary, generate a concise and professional **PlantUML diagram** that visually represents the system's architecture, major components, and data flow. Focus on:

- **Logical grouping of components** (e.g., services, databases, APIs)
- **Key interactions** between components and external systems
- **Data flow** between major components

**Instructions:**

- **Use a left-to-right layout** with inputs (e.g., users) on the left and external systems on the right.
- **Group related components** using boundaries or packages.
- **Label nodes and edges clearly**, avoiding special characters and using alphanumeric characters and underscores.
- **Represent external dependencies distinctly**, using appropriate stereotypes or icons.
- **Encapsulate internal components** within a boundary named after the system.
- **Include the user** as an actor interacting with the system.
- **Apply minimal colors** to differentiate logical groupings without overwhelming the diagram.
- **Avoid mentioning file extensions, function parameters, parentheses, or quotation marks**.
- **Ensure PlantUML syntax is correct** and the diagram can be rendered without errors.
- **Do not include any additional text** beyond the PlantUML code.
- **Do not include code block markers such as ```plantuml, ```, @startuml, @enduml; provide only the raw PlantUML code**

---

**Input:**  
- Codebase summary: {combined_summary}

**Your Task:**  
Generate valid PlantUML code that illustrates the system's architecture and data flows based on the provided summary. Output only the PlantUML code."""

    # Maximum number of regeneration attempts
    MAX_REGENERATION_ATTEMPTS = 3

    def __init__(self, output_dir: Path, diagram_type: str = None):
        """
        Initialize the diagram generator.
        
        Args:
            output_dir: Directory where diagrams will be saved
            diagram_type: Type of diagram to generate (default from config if None)
        """
        self.output_dir = output_dir
        self.diagram_type = diagram_type or DiagramConfig.DEFAULT_DIAGRAM_TYPE
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        logging.info(f"Initialized diagram generator for {diagram_type} diagrams")
    
    def generate_diagrams(self, codebase_summary: str) -> Dict[str, Any]:
        """
        Generate architecture diagrams based on the codebase summary.
        
        Args:
            codebase_summary: Summary of the codebase
            
        Returns:
            Dictionary containing diagram information
        """
        logging.info(f"Generating {self.diagram_type} diagrams")
        
        # Create prompt for diagram generation
        prompt = self._create_diagram_prompt(codebase_summary)
        
        # Save the prompt
        prompt_path = self.output_dir / f"{self.diagram_type}_prompt.txt"
        save_to_file(prompt, prompt_path)
        
        diagrams = {}
        
        # Generate diagrams
        try:
            # Generate low-level diagram
            low_level_result = self._generate_diagram_with_retry(prompt, "low_level")
            if low_level_result["diagram_path"]:
                with open(low_level_result["diagram_path"], "rb") as img_file:
                    base64_image = base64.b64encode(img_file.read()).decode("utf-8")
                low_level_result["diagram_base64"] = base64_image  
            diagrams["low_level"] = low_level_result
            
            # Generate high-level diagram
            high_level_result = self._generate_diagram_with_retry(prompt, "high_level")
            if high_level_result["diagram_path"]:
                with open(high_level_result["diagram_path"], "rb") as img_file:
                    base64_image = base64.b64encode(img_file.read()).decode("utf-8")
                high_level_result["diagram_base64"] = base64_image
            diagrams["high_level"] = high_level_result
            
            logging.info("Diagram generation complete")
            
        except Exception as e:
            logging.error(f"Error generating diagrams: {e}")
            diagrams["error"] = str(e)
        
        return diagrams
    
    def _create_diagram_prompt(self, codebase_summary: str) -> str:
        """
        Create a prompt for diagram generation based on diagram type.
        
        Args:
            codebase_summary: Summary of the codebase
            
        Returns:
            Prompt text for diagram generation
        """
        if self.diagram_type.lower() == "mermaid":
            return self.MERMAID_PROMPT_TEMPLATE.format(combined_summary=codebase_summary)
        elif self.diagram_type.lower() == "plantuml":
            return self.PLANTUML_PROMPT_TEMPLATE.format(combined_summary=codebase_summary)
        else:
            raise ValueError(f"Unsupported diagram type: {self.diagram_type}")

    def _generate_diagram_with_retry(self, prompt: str, diagram_level: str) -> Dict[str, Any]:
        """
        Generate a diagram with multiple attempts if rendering fails.
        
        Args:
            prompt: Base prompt for diagram generation
            diagram_level: Level of the diagram ("high_level" or "low_level")
            
        Returns:
            Dictionary containing diagram information
        """
        for attempt in range(self.MAX_REGENERATION_ATTEMPTS):
            try:
                logging.info(f"Generating {diagram_level} diagram (attempt {attempt+1}/{self.MAX_REGENERATION_ATTEMPTS})")
                
                # Generate diagram based on level
                if diagram_level == "low_level":
                    diagram_result = self._generate_low_level_diagram(prompt)
                else:
                    diagram_result = self._generate_high_level_diagram(prompt)
                
                # Clean the diagram code
                diagram_code = self._clean_diagram_code(diagram_result.get("code", ""))
                
                # Save the diagram code with attempt number
                code_path = self.output_dir / f"{self.diagram_type}_{diagram_level}_diagram_attempt_{attempt+1}.txt"
                save_to_file(diagram_code, code_path)
                
                # Render the diagram
                try:
                    diagram_path = self._render_diagram(diagram_code, diagram_level)
                    if diagram_path:
                        return {
                            "code": diagram_code,
                            "code_path": str(code_path),
                            "diagram_path": str(diagram_path),
                            "attempts": attempt + 1
                        }
                except Exception as render_error:
                    logging.error(f"Error rendering {diagram_level} diagram (attempt {attempt+1}): {render_error}")
                    # Continue to next attempt instead of trying to fix the code
            
            except Exception as e:
                logging.error(f"Error generating {diagram_level} diagram (attempt {attempt+1}): {e}")
        
        logging.error(f"Failed to generate {diagram_level} diagram after {self.MAX_REGENERATION_ATTEMPTS} attempts")
        return {
            "code": diagram_code if 'diagram_code' in locals() else "",
            "code_path": str(code_path) if 'code_path' in locals() else None,
            "diagram_path": None,
            "error": f"Failed to generate valid diagram after {self.MAX_REGENERATION_ATTEMPTS} attempts",
            "attempts": self.MAX_REGENERATION_ATTEMPTS
        }
    
    def _generate_low_level_diagram(self, prompt: str) -> Dict[str, Any]:
        """
        Generate a low-level architecture diagram using OpenAI API.
        
        Args:
            prompt: Prompt for diagram generation
            
        Returns:
            Dictionary containing diagram information
        """
        logging.info("Generating low-level architecture diagram")
        
        try:
            # Call OpenAI API with enhanced prompt for low-level diagrams
            diagram_code = self._call_openai_api(
                prompt=f"""You are an expert software engineer tasked with analyzing a codebase to generate detailed low-level architecture diagrams. Based on the code provided below, create detailed class hierarchies and function call graphs.

TASK:
1. Analyze the provided code to identify:
   - Class definitions and their relationships (inheritance, composition, implementation)
   - Function/method definitions and their call patterns
   - Important interfaces and abstract classes
   - Key data structures and their usage

2. Create a Mermaid diagram showing:
   - Make sure the diagram is strictly medium sized in nature and colourfull for better understanding.
   - All classes and their inheritance relationships
   - Interface implementations
   - Composition relationships
   - Important properties and methods

OUTPUT REQUIREMENTS:
1. Use Mermaid.js syntax
2. For class relationships:
   - Show inheritance with arrows
   - Show composition with diamond-ended arrows
   - Include important methods and properties
3. Use different node styles for different component types
4. Add appropriate styling to improve readability

VERY IMPORTANT GUIDELINES:
- Make sure the diagram code starts with "graph LR" or "graph TD"
- Ensure all syntax is valid and can be rendered in Mermaid
- Use simple labels with only alphanumeric characters and underscores
- Avoid any special characters or code block markers
- Keep the diagram focused and readable with 10-20 nodes maximum
- Verify that all node IDs are correctly referenced in connections
- Make sure all subgraphs have proper start and end tags
- Make sure that all the conmponents are included in the diagram and it is well explained in detailed manner.
- Make sure the diagram is strictly medium sized in nature and colourfull for better understanding.
- Make sure that the diagram is very easily understandable and it is very detailed in manner rather then creating a simple diagram.

Here is the code to analyze:

{prompt}""")
            
            return {"code": diagram_code}
            
        except Exception as e:
            logging.error(f"Error generating low-level diagram: {e}")
            return {"error": str(e)}
    
    def _generate_high_level_diagram(self, prompt: str) -> Dict[str, Any]:
        """
        Generate a high-level architecture diagram using OpenAI API.
        
        Args:
            prompt: Prompt for diagram generation
            
        Returns:
            Dictionary containing diagram information
        """
        logging.info("Generating high-level architecture diagram")
        
        try:
            # Call OpenAI API with enhanced prompt for high-level diagrams
            diagram_code = self._call_openai_api(
                prompt=f"""You are an expert software architect tasked with analyzing a codebase to generate a high-level system architecture diagram. Based on the code summary provided below, create a comprehensive system architecture and dependency visualization.

TASK:
1. Analyze the provided code summary to identify key components, services, modules, and their relationships.
2. Create a Mermaid flowchart diagram that shows:
   - Make sure the diagram is strictly medium sized in nature and colourfull for better understanding.
   - Main system components (services, modules, controllers, etc.)
   - Interactions and dependencies between components
   - External services or dependencies
   - Data stores and their connections to services
   - Clear direction of data flow and control
   
OUTPUT REQUIREMENTS:
1. Use Mermaid.js flowchart syntax
2. Group related components using subgraph where appropriate
3. Use different node shapes or colors to distinguish between component types

VERY IMPORTANT GUIDELINES:
- Make sure the diagram code starts with "graph LR" on the first line
- Ensure all syntax is valid and can be rendered in Mermaid
- Use simple labels with only alphanumeric characters and underscores
- Avoid any special characters or code block markers
- Keep the diagram focused and readable with 10-15 nodes maximum
- Verify that all node IDs are correctly referenced in connections
- Make sure all subgraphs have proper start and end tags

Here is the code summary to analyze:

{prompt}""")
            
            return {"code": diagram_code}
            
        except Exception as e:
            logging.error(f"Error generating high-level diagram: {e}")
            return {"error": str(e)}
    
    def _clean_diagram_code(self, diagram_code: str) -> str:
        """
        Clean the diagram code by removing code block markers and extra text.
        
        Args:
            diagram_code: Raw diagram code from LLM
            
        Returns:
            Cleaned diagram code
        """
        # Build a regex pattern to match code block markers
        diagram_type = self.diagram_type.lower()
        block_marker_pattern = rf'```(?:{diagram_type})?\s*\n|```|:::(?:{diagram_type})?\s*\n|:::'
        
        # Remove code block markers
        cleaned_code = re.sub(block_marker_pattern, '', diagram_code, flags=re.MULTILINE)
        
        # Remove leading and trailing whitespace
        cleaned_code = cleaned_code.strip()
        
        # For Mermaid, ensure it starts with graph definition
        if diagram_type == "mermaid" and not cleaned_code.strip().startswith(('graph ', 'flowchart ')):
            cleaned_code = "graph LR\n" + cleaned_code
        
        return cleaned_code
    
    def _render_diagram(self, diagram_code: str, diagram_level: str) -> Optional[Path]:
        """
        Render the diagram code to an image file.
        
        Args:
            diagram_code: Diagram code to render
            diagram_level: Level of the diagram (high_level or low_level)
            
        Returns:
            Path to the rendered image file, or None if rendering failed
        """
        try:
            renderer = get_renderer(self.diagram_type)
            
            # Generate the diagram (no retry here - we'll retry at higher level)
            png_path = renderer.generate_png(diagram_code, self.output_dir)
            
            if png_path:
                # Rename with the diagram level
                new_path = png_path.parent / f"{png_path.stem}_{diagram_level}{png_path.suffix}"
                png_path.rename(new_path)
                png_path = new_path
                
                logging.info(f"Successfully rendered {diagram_level} diagram to {png_path}")
                return png_path
            else:
                raise Exception("Rendering returned no PNG filepath")
                    
        except Exception as e:
            logging.error(f"Error in _render_diagram: {e}")
            # We'll propagate this error up to trigger a retry
            raise
    
    def _call_openai_api(self, prompt: str) -> str:
        """
        Call the OpenAI API to generate diagram code.
        
        Args:
            prompt: Prompt text
            
        Returns:
            Generated diagram code
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {LLMConfig.OPENAI_API_KEY}"
            }
            
            payload = {
                "model": "gpt-4",  # or your preferred OpenAI model
                "messages": [
                    {"role": "system", "content": self.DIAGRAM_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                logging.error(f"OpenAI API error: {response.status_code} - {response.text}")
                return ""
                
            result = response.json()
            diagram_code = result["choices"][0]["message"]["content"]
            
            return diagram_code
            
        except Exception as e:
            logging.error(f"Error calling OpenAI API: {e}")
            return ""