from flask import Flask, render_template
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('MY_SECRET_KEY', 'gelistirici-gizli-key')


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)