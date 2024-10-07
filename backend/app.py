from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from React

@app.route('/')
def home():
    return {'message': 'Backend is running'}

if __name__ == '__main__':
    app.run(debug=True)
