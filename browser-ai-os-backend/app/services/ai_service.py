# from groq import Groq
# from app.config import settings
# from typing import List, Dict

# class AIService:
#     def __init__(self):
#         self.client = Groq(api_key=settings.groq_api_key)
#         self.model = settings.groq_model
    
#     async def chat(self, messages: List[Dict[str, str]]) -> str:
#         """Send chat messages to Groq and get response"""
#         try:
#             response = self.client.chat.completions.create(
#                 model=self.model,
#                 messages=messages,
#                 max_tokens=settings.max_tokens,
#                 temperature=0.7
#             )
#             return response.choices[0].message.content
#         except Exception as e:
#             return f"Error: {str(e)}"
    
#     async def execute_terminal_command(self, command: str, context: Dict = None) -> str:
#         """Execute terminal command using AI"""
#         system_prompt = """You are an AI assistant for a browser-based operating system. 
# You help execute terminal commands by interpreting natural language.

# Available operations:
# - File operations: create, delete, list, read, search files/folders
# - Note operations: create, update, delete, list, search notes
# - System operations: show time, calculate, answer questions
# - Cross-app operations: interact with files and notes

# Return responses in a clear, terminal-friendly format.
# For file/note operations, provide confirmation messages.
# For questions, provide concise answers.
# """
        
#         context_str = ""
#         if context:
#             context_str = f"\nContext: {context}"
        
#         messages = [
#             {
#                 "role": "system",
#                 "content": system_prompt
#             },
#             {
#                 "role": "user",
#                 "content": f"{context_str}\n\nCommand: {command}"
#             }
#         ]
        
#         return await self.chat(messages)
    
#     async def enhance_note(self, action: str, content: str) -> str:
#         """Enhance note content using AI"""
#         prompts = {
#             "improve": "Improve the following note by fixing grammar, enhancing clarity, and making it more professional:\n\n",
#             "summarize": "Provide a concise summary of the following note:\n\n",
#             "outline": "Create a structured outline from the following note:\n\n",
#             "expand": "Expand on the following note with more details and examples:\n\n"
#         }
        
#         prompt = prompts.get(action, prompts["improve"])
        
#         messages = [
#             {
#                 "role": "user",
#                 "content": f"{prompt}{content}"
#             }
#         ]
        
#         return await self.chat(messages)

# # Singleton instance
# ai_service = AIService()



from groq import Groq
from app.config import settings
from typing import List, Dict, Optional
import json
from datetime import datetime

class AIService:
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model
    
    async def chat(self, messages: List[Dict[str, str]]) -> str:
        """Send chat messages to Groq and get response"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=settings.max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def execute_terminal_command(self, command: str, context: Dict = None, db = None) -> str:
        """Execute terminal command using AI with actual CRUD operations"""
        
        system_prompt = """You are an AI terminal assistant for a browser-based operating system.
You interpret natural language commands and execute file/note CRUD operations.

IMPORTANT: You must respond with a JSON object containing:
{
    "action": "create_file|read_file|update_file|delete_file|list_files|create_note|read_note|update_note|delete_note|list_notes|search|help|info|calculate",
    "target": "files|notes|system",
    "params": {
        // Parameters specific to the action
    },
    "message": "Human-readable message about what you're doing"
}

EXAMPLES:

User: "create a file called hello.txt with content Hello World"
Response: {
    "action": "create_file",
    "target": "files",
    "params": {
        "name": "hello.txt",
        "content": "Hello World",
        "type": "file"
    },
    "message": "Creating file 'hello.txt' with content"
}

User: "make a new note about my meeting"
Response: {
    "action": "create_note",
    "target": "notes",
    "params": {
        "title": "Meeting Notes",
        "content": "",
        "tags": "meeting"
    },
    "message": "Creating new note 'Meeting Notes'"
}

User: "list all my files"
Response: {
    "action": "list_files",
    "target": "files",
    "params": {},
    "message": "Listing all files"
}

User: "delete the file named test.txt"
Response: {
    "action": "delete_file",
    "target": "files",
    "params": {
        "name": "test.txt"
    },
    "message": "Deleting file 'test.txt'"
}

User: "show me my notes about work"
Response: {
    "action": "search",
    "target": "notes",
    "params": {
        "query": "work"
    },
    "message": "Searching notes for 'work'"
}

User: "what time is it"
Response: {
    "action": "info",
    "target": "system",
    "params": {
        "type": "time"
    },
    "message": "Getting current time"
}

User: "calculate 25 * 4"
Response: {
    "action": "calculate",
    "target": "system",
    "params": {
        "expression": "25 * 4"
    },
    "message": "Calculating: 25 * 4"
}

ALWAYS respond with valid JSON only. No extra text."""

        context_str = ""
        if context:
            context_str = f"\nSystem Context:\n- Files: {context.get('files_count', 0)}\n- Notes: {context.get('notes_count', 0)}"
            if context.get('recent_files'):
                context_str += f"\n- Recent files: {', '.join(context['recent_files'])}"
            if context.get('recent_notes'):
                context_str += f"\n- Recent notes: {', '.join(context['recent_notes'])}"
        
        messages = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": f"{context_str}\n\nCommand: {command}"
            }
        ]
        
        # Get AI interpretation
        ai_response = await self.chat(messages)
        
        # Parse AI response
        try:
            # Clean response (remove markdown code blocks if present)
            clean_response = ai_response.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.startswith("```"):
                clean_response = clean_response[3:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            clean_response = clean_response.strip()
            
            intent = json.loads(clean_response)
            
            # Execute the action if db is provided
            if db:
                result = await self._execute_action(intent, db)
                return result
            else:
                return intent.get("message", "Command interpreted but no database connection available")
                
        except json.JSONDecodeError as e:
            return f"AI Response parsing error: {str(e)}\nRaw response: {ai_response}"
        except Exception as e:
            return f"Execution error: {str(e)}"
    
    async def _execute_action(self, intent: Dict, db) -> str:
        """Execute the actual CRUD operation based on AI intent"""
        from app.models.file import File
        from app.models.note import Note
        import os
        
        action = intent.get("action")
        params = intent.get("params", {})
        message = intent.get("message", "")
        
        try:
            # FILE OPERATIONS
            if action == "create_file":
                # Create file
                name = params.get("name", "untitled.txt")
                content = params.get("content", "")
                parent_path = params.get("parent_path")
                
                if parent_path:
                    file_path = f"{parent_path}/{name}"
                else:
                    file_path = f"/{name}"
                
                # Check if exists
                existing = db.query(File).filter(File.path == file_path).first()
                if existing:
                    return f"Error: File '{name}' already exists at {file_path}"
                
                # Create database entry
                db_file = File(
                    name=name,
                    path=file_path,
                    type="file",
                    parent_path=parent_path,
                    is_folder=False,
                    size=len(content)
                )
                
                # Create physical file
                full_path = os.path.join(settings.storage_path, file_path.lstrip("/"))
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, "w") as f:
                    f.write(content)
                
                db.add(db_file)
                db.commit()
                
                return f"File created: {name}\nPath: {file_path}\nSize: {len(content)} bytes"
            
            elif action == "create_folder":
                # Create folder
                name = params.get("name", "New Folder")
                parent_path = params.get("parent_path")
                
                if parent_path:
                    folder_path = f"{parent_path}/{name}"
                else:
                    folder_path = f"/{name}"
                
                existing = db.query(File).filter(File.path == folder_path).first()
                if existing:
                    return f"Error: Folder '{name}' already exists"
                
                db_folder = File(
                    name=name,
                    path=folder_path,
                    type="folder",
                    parent_path=parent_path,
                    is_folder=True,
                    size=0
                )
                
                full_path = os.path.join(settings.storage_path, folder_path.lstrip("/"))
                os.makedirs(full_path, exist_ok=True)
                
                db.add(db_folder)
                db.commit()
                
                return f"Folder created: {name}\nPath: {folder_path}"
            
            elif action == "list_files":
                path = params.get("path", "/")
                
                if path == "/":
                    files = db.query(File).filter(File.parent_path == None).all()
                else:
                    files = db.query(File).filter(File.parent_path == path).all()
                
                if not files:
                    return f"No files found in {path}"

                output = f"Files in {path}:\n\n"
                for f in files:
                    size = f"{f.size} bytes" if not f.is_folder else "folder"
                    output += f"{f.name} ({size})\n"

                return output
            
            elif action == "read_file":
                name = params.get("name")
                file_id = params.get("id")
                
                if file_id:
                    db_file = db.query(File).filter(File.id == file_id).first()
                elif name:
                    db_file = db.query(File).filter(File.name == name).first()
                else:
                    return "❌ Error: Please specify file name or ID"
                
                if not db_file:
                    return f"Error: File not found"

                if db_file.is_folder:
                    return f"Error: Cannot read folder content"

                full_path = os.path.join(settings.storage_path, db_file.path.lstrip("/"))

                with open(full_path, "r") as f:
                    content = f.read()

                return f"{db_file.name}\n{'='*50}\n{content}\n{'='*50}\nSize: {db_file.size} bytes"
            
            elif action == "update_file":
                name = params.get("name")
                new_content = params.get("content")
                new_name = params.get("new_name")
                
                db_file = db.query(File).filter(File.name == name).first()
                if not db_file:
                    return f"Error: File '{name}' not found"
                
                full_path = os.path.join(settings.storage_path, db_file.path.lstrip("/"))
                
                if new_content is not None:
                    with open(full_path, "w") as f:
                        f.write(new_content)
                    db_file.size = os.path.getsize(full_path)
                    db_file.modified_at = datetime.utcnow()
                
                if new_name:
                    old_path = full_path
                    new_path = os.path.join(os.path.dirname(full_path), new_name)
                    os.rename(old_path, new_path)
                    db_file.name = new_name
                    db_file.path = db_file.path.replace(name, new_name)
                
                db.commit()
                return f"File updated: {db_file.name}"
            
            elif action == "delete_file":
                name = params.get("name")
                
                db_file = db.query(File).filter(File.name == name).first()
                if not db_file:
                    return f"Error: File '{name}' not found"
                
                full_path = os.path.join(settings.storage_path, db_file.path.lstrip("/"))
                
                if os.path.exists(full_path):
                    if db_file.is_folder:
                        import shutil
                        shutil.rmtree(full_path)
                    else:
                        os.remove(full_path)
                
                db.delete(db_file)
                db.commit()
                
                return f"Deleted: {name}"
            
            # NOTE OPERATIONS
            elif action == "create_note":
                title = params.get("title", "Untitled Note")
                content = params.get("content", "")
                tags = params.get("tags", "")
                
                db_note = Note(
                    title=title,
                    content=content,
                    tags=tags,
                    pinned=False
                )
                
                db.add(db_note)
                db.commit()
                
                return f"Note created: {title}\nID: {db_note.id}"
            
            elif action == "list_notes":
                notes = db.query(Note).order_by(Note.modified_at.desc()).all()
                
                if not notes:
                    return "No notes found"

                output = "Your Notes:\n\n"
                for note in notes:
                    tags = f"[{note.tags}]" if note.tags else ""
                    output += f"{note.title} {tags}\n"
                    output += f"   ID: {note.id} | Modified: {note.modified_at.strftime('%Y-%m-%d %H:%M')}\n\n"

                return output
            
            elif action == "read_note":
                title = params.get("title")
                note_id = params.get("id")
                
                if note_id:
                    db_note = db.query(Note).filter(Note.id == note_id).first()
                elif title:
                    db_note = db.query(Note).filter(Note.title.ilike(f"%{title}%")).first()
                else:
                    return "❌ Error: Please specify note title or ID"
                
                if not db_note:
                    return "Error: Note not found"

                output = f"{db_note.title}\n"
                output += f"{'='*50}\n"
                output += f"{db_note.content}\n"
                output += f"{'='*50}\n"
                output += f"Tags: {db_note.tags or 'None'}\n"
                output += f"Modified: {db_note.modified_at.strftime('%Y-%m-%d %H:%M')}"

                return output
            
            elif action == "update_note":
                title = params.get("title")
                new_content = params.get("content")
                new_title = params.get("new_title")
                tags = params.get("tags")
                
                db_note = db.query(Note).filter(Note.title.ilike(f"%{title}%")).first()
                if not db_note:
                    return f"Error: Note '{title}' not found"
                
                if new_content is not None:
                    db_note.content = new_content
                if new_title:
                    db_note.title = new_title
                if tags is not None:
                    db_note.tags = tags
                
                db_note.modified_at = datetime.utcnow()
                db.commit()
                
                return f"Note updated: {db_note.title}"
            
            elif action == "delete_note":
                title = params.get("title")
                note_id = params.get("id")
                
                if note_id:
                    db_note = db.query(Note).filter(Note.id == note_id).first()
                elif title:
                    db_note = db.query(Note).filter(Note.title.ilike(f"%{title}%")).first()
                else:
                    return "❌ Error: Please specify note title or ID"
                
                if not db_note:
                    return "Error: Note not found"
                
                note_title = db_note.title
                db.delete(db_note)
                db.commit()
                
                return f"Deleted note: {note_title}"
            
            # SEARCH OPERATIONS
            elif action == "search":
                query = params.get("query", "")
                target = intent.get("target", "files")
                
                if target == "files":
                    results = db.query(File).filter(File.name.ilike(f"%{query}%")).all()
                    if not results:
                        return f"No files found matching '{query}'"
                    
                    output = f"Search results for '{query}':\n\n"
                    for f in results:
                        output += f"{f.name} - {f.path}\n"
                    return output
                
                elif target == "notes":
                    results = db.query(Note).filter(
                        (Note.title.ilike(f"%{query}%")) | 
                        (Note.content.ilike(f"%{query}%"))
                    ).all()
                    
                    if not results:
                        return f"No notes found matching '{query}'"
                    
                    output = f"Search results for '{query}':\n\n"
                    for note in results:
                        output += f"{note.title}\n"
                        output += f"   {note.content[:100]}...\n\n"
                    return output
            
            # SYSTEM OPERATIONS
            elif action == "info":
                info_type = params.get("type", "system")
                
                if info_type == "time":
                    now = datetime.now()
                    return f"Current time: {now.strftime('%Y-%m-%d %H:%M:%S')}"

                elif info_type == "system":
                    files_count = db.query(File).count()
                    notes_count = db.query(Note).count()
                    total_size = db.query(File).with_entities(File.size).all()
                    total_bytes = sum(s[0] or 0 for s in total_size)
                    
                    output = "System Information:\n\n"
                    output += f"Files: {files_count}\n"
                    output += f"Notes: {notes_count}\n"
                    output += f"Storage used: {total_bytes} bytes\n"
                    return output
            
            elif action == "calculate":
                expression = params.get("expression", "")
                try:
                    result = eval(expression, {"__builtins__": {}}, {})
                    return f"{expression} = {result}"
                except Exception as e:
                    return f"Calculation error: {str(e)}"
            
            elif action == "help":
                                return """AI Terminal Help

FILE COMMANDS:
    - "create file NAME with content TEXT"
    - "list files" / "show all files"
    - "read file NAME"
    - "update file NAME with content TEXT"
    - "delete file NAME"
    - "search files for QUERY"

NOTE COMMANDS:
    - "create note TITLE about TEXT"
    - "list notes" / "show my notes"
    - "read note TITLE"
    - "update note TITLE with TEXT"
    - "delete note TITLE"
    - "search notes for QUERY"

SYSTEM COMMANDS:
    - "what time is it"
    - "show system info"
    - "calculate EXPRESSION"
    - "help"

Just type naturally! I'll understand what you want to do."""
            
            else:
                return f"Unknown action: {action}\nTry: help"
        
        except Exception as e:
            return f"Error executing {action}: {str(e)}"
    
    async def enhance_note(self, action: str, content: str) -> str:
        """Enhance note content using AI"""
        prompts = {
            "improve": "Improve the following note by fixing grammar, enhancing clarity, and making it more professional:\n\n",
            "summarize": "Provide a concise summary of the following note:\n\n",
            "outline": "Create a structured outline from the following note:\n\n",
            "expand": "Expand on the following note with more details and examples:\n\n"
        }
        
        prompt = prompts.get(action, prompts["improve"])
        
        messages = [
            {
                "role": "user",
                "content": f"{prompt}{content}"
            }
        ]
        
        return await self.chat(messages)

# Singleton instance
ai_service = AIService()