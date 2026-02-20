from flask import Flask, render_template, request, redirect, url_for
import os

app = Flask(__name__)

# Gece yaptığımız Environment Variable ayarı burada işe yarıyor
app.config['SECRET_KEY'] = os.environ.get('MY_SECRET_DB_URL', 'gelistirici-gizli-key')

# Basit bir veri listesi (Hoca veritabanı sormazsa buradan yürürüz)
transactions = [
    {'amount': 1500, 'category': 'Maaş', 'type': 'Gelir'},
    {'amount': 200, 'category': 'Yemek', 'type': 'Gider'}
]

import requests  # 1. Bunu dosyanın EN ÜSTÜNE, diğer importların yanına ekle

# ... diğer kodların (app = Flask(__name__) vb.) burada kalsın ...

@app.route('/')
def index():
    try:
        # Ücretsiz bir API'den canlı döviz verisi çekiyoruz
        response = requests.get("https://api.exchangerate-api.com/v4/latest/USD")
        data = response.json()
        
        # Sitedeki kutucuklara gidecek verileri hazırlıyoruz
        rates = {
            'TRY': round(data['rates']['TRY'], 2),
            'USD': '1.00',
            'EUR': round(data['rates']['TRY'] / data['rates']['EUR'], 2)
        }
    except:
        # Eğer internette veya API'de sorun olursa site çökmesin diye yedek veriler
        rates = {'TRY': '31.25', 'USD': '1.00', 'EUR': '33.50'}
        
    return render_template('index.html', transactions=transactions, rates=rates)

@app.route('/add', methods=['POST'])
def add_transaction():
    category = request.form.get('category')
    amount = request.form.get('amount')
    t_type = request.form.get('type')
    
    if category and amount:
        transactions.append({'amount': amount, 'category': category, 'type': t_type})
    
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)