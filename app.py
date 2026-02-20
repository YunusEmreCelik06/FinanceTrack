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

@app.route('/')
def index():
    # Geçici olarak boş bir rates sözlüğü ekliyoruz ki hata vermesin
    rates = {'TRY': '0.00', 'USD': '0.00', 'EUR': '0.00'}
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