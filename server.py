from flask import Flask, request, jsonify, send_from_directory
import os, json, argparse

app = Flask(__name__)
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(PROJECT_DIR, 'pics')
IMAGES_JSON = os.path.join(PROJECT_DIR, "images.json")

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename: str) -> bool:
  return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def update_images_json() -> None:
  os.makedirs(UPLOAD_FOLDER, exist_ok=True)
  files = []
  for name in sorted(os.listdir(UPLOAD_FOLDER), key=str.lower):
    if name.startswith("."):
      continue
    ext = os.path.splitext(name)[1].lower()
    if ext[1:] in ALLOWED_EXTENSIONS:
      files.append(name)
  with open(IMAGES_JSON, "w", encoding="utf-8") as f:
    json.dump(files, f, ensure_ascii=False, indent=2)
  print(f"Updated {IMAGES_JSON} with {len(files)} images.")

@app.route('/upload', methods=['POST'])
def upload_file():
  if 'file' not in request.files:
    return jsonify({"status": "error", "message": "No file part"}), 400

  files = request.files.getlist('file')
  if not files:
    return jsonify({"status": "error", "message": "No files selected"}), 400

  saved = []
  os.makedirs(UPLOAD_FOLDER, exist_ok=True)
  for file in files:
    if file and allowed_file(file.filename):
      # Basic filename safety (no path components)
      filename = os.path.basename(file.filename)
      filepath = os.path.join(UPLOAD_FOLDER, filename)
      file.save(filepath)
      saved.append(filename)

  update_images_json()
  return jsonify({"status": "success", "saved": saved}), 200

@app.route('/')
def index():
  return send_from_directory(PROJECT_DIR, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
  return send_from_directory(PROJECT_DIR, filename)

@app.route('/pics/<path:filename>')
def pics_files(filename):
  return send_from_directory(UPLOAD_FOLDER, filename)

def main():
  parser = argparse.ArgumentParser()
  parser.add_argument('--port', type=int, default=5000, help='Port to run the server on')
  args = parser.parse_args()

  os.makedirs(UPLOAD_FOLDER, exist_ok=True)
  update_images_json()
  app.run(debug=True, host='0.0.0.0', port=args.port)

if __name__ == '__main__':
  main()