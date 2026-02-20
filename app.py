from flask import Flask, render_template, jsonify
import os

app = Flask(__name__)

# Hocanın istediği: Veritabanı bağlantısı dışarıdan (Environment Variable) alınmalı
# Azure panelinden 'AZURE_DATABASE_URL' isminde tanımlayacağız
DATABASE_CONNECTION = os.environ.get('AZURE_DATABASE_URL', 'Development_Mode_Active')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/status')
def get_status():
    return jsonify({
        "project": "FinTrack Global",
        "status": "Running on Azure",
        "db_config": DATABASE_CONNECTION
    })

if __name__ == '__main__':
    # Azure'un port ayarlarını otomatik yakalaması için gerekli
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)