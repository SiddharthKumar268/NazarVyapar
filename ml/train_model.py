import pandas as pd
import pickle
import numpy as np
import datetime
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

try:
    df = pd.read_csv('data.csv')
except FileNotFoundError:
    print('data.csv not found. Run export_data.py first.')
    exit()

day_order = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
le = LabelEncoder()
le.fit(day_order)
df['day_encoded'] = le.transform(df['day'])

# add derived features to help model generalize
df['is_weekend']  = df['day_encoded'].apply(lambda x: 1 if x >= 5 else 0)
df['is_morning']  = df['hour'].apply(lambda x: 1 if 6 <= x <= 11 else 0)
df['is_evening']  = df['hour'].apply(lambda x: 1 if 17 <= x <= 21 else 0)
df['is_night']    = df['hour'].apply(lambda x: 1 if x <= 5 or x >= 22 else 0)
df['light_bucket'] = pd.cut(df['light'], bins=5, labels=[1,2,3,4,5]).astype(int)

features = ['hour','day_encoded','light','is_weekend','is_morning','is_evening','is_night','light_bucket']
target   = 'count'

df = df.dropna(subset=features + [target])
X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=True)

models = {
    'Gradient Boosting': GradientBoostingRegressor(
        n_estimators=150,
        learning_rate=0.05,
        max_depth=3,
        min_samples_split=10,
        min_samples_leaf=5,
        subsample=0.8,
        random_state=42
    ),
    'Random Forest': RandomForestRegressor(
        n_estimators=150,
        max_depth=6,
        min_samples_split=10,
        min_samples_leaf=5,
        max_features='sqrt',
        random_state=42
    ),
    'Ridge Regression': Pipeline([
        ('scaler', StandardScaler()),
        ('model',  Ridge(alpha=10.0))
    ])
}

results      = {}
best_model   = None
best_name    = None
best_mae     = float('inf')

kf = KFold(n_splits=5, shuffle=True, random_state=42)

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    preds = np.maximum(preds, 0)

    mae  = mean_absolute_error(y_test, preds)
    mse  = mean_squared_error(y_test, preds)
    rmse = np.sqrt(mse)
    r2   = r2_score(y_test, preds)
    acc  = max(0, 100 - (mae / (y.mean() + 1e-9) * 100))
    cv   = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_absolute_error')
    cv_mae   = -cv.mean()
    cv_std   = cv.std()
    overfit  = abs(mae - cv_mae)

    results[name] = {
        'model':   model,
        'mae':     mae,
        'mse':     mse,
        'rmse':    rmse,
        'r2':      r2,
        'acc':     acc,
        'cv_mae':  cv_mae,
        'cv_std':  cv_std,
        'overfit': overfit
    }

    if mae < best_mae:
        best_mae   = mae
        best_name  = name
        best_model = model

report = []
report.append('═══════════════════════════════════════════════════')
report.append('       NazarVyapar — ML Training Report            ')
report.append('       ' + str(datetime.datetime.now().strftime('%d %b %Y · %H:%M:%S')))
report.append('═══════════════════════════════════════════════════')
report.append('')
report.append('DATASET')
report.append('  Total records     : ' + str(len(df)))
report.append('  Train size        : ' + str(len(X_train)))
report.append('  Test size         : ' + str(len(X_test)))
report.append('  Features          : ' + str(features))
report.append('  Target            : ' + target)
report.append('  Avg footfall/slot : ' + str(round(y.mean(), 2)))
report.append('  Max footfall/slot : ' + str(int(y.max())))
report.append('  Min footfall/slot : ' + str(int(y.min())))
report.append('')

for name, r in results.items():
    report.append('───────────────────────────────────────────────────')
    report.append('MODEL : ' + name)
    report.append('')
    report.append('  MAE             : ' + str(round(r['mae'], 4)) + ' visitors')
    report.append('  RMSE            : ' + str(round(r['rmse'], 4)))
    report.append('  MSE             : ' + str(round(r['mse'], 4)))
    report.append('  R² Score        : ' + str(round(r['r2'], 4)) + '  (1.0 = perfect)')
    report.append('  Approx Accuracy : ' + str(round(r['acc'], 2)) + '%')
    report.append('  CV MAE (5-fold) : ' + str(round(r['cv_mae'], 4)))
    report.append('  CV Std Dev      : ' + str(round(r['cv_std'], 4)))
    report.append('  Overfit Gap     : ' + str(round(r['overfit'], 4)) + ('  ✓ low' if r['overfit'] < 100 else '  ✗ high — overfitting'))
    report.append('')

    if hasattr(r['model'], 'feature_importances_'):
        fi = dict(zip(features, r['model'].feature_importances_))
        report.append('  Feature Importance:')
        for k,v in sorted(fi.items(), key=lambda x: -x[1]):
            bar = '█' * int(v * 40)
            report.append('    ' + k.ljust(16) + ': ' + str(round(v*100,2)).rjust(6) + '%  ' + bar)
    report.append('')

report.append('═══════════════════════════════════════════════════')
report.append('BEST MODEL : ' + best_name)
report.append('  Test MAE : ' + str(round(best_mae, 4)) + ' visitors')
report.append('  CV MAE   : ' + str(round(results[best_name]['cv_mae'], 4)))
report.append('  Overfit  : ' + str(round(results[best_name]['overfit'], 4)))
report.append('  Saved as : model.pkl')
report.append('═══════════════════════════════════════════════════')

report_text = '\n'.join(report)
print(report_text)

with open('training_report.txt', 'w', encoding='utf-8') as f:
    f.write(report_text)

with open('model.pkl', 'wb') as f:
    pickle.dump(best_model, f)

with open('encoder.pkl', 'wb') as f:
    pickle.dump(le, f)

with open('features.pkl', 'wb') as f:
    pickle.dump(features, f)

print('')
print('Saved: model.pkl · encoder.pkl · features.pkl · training_report.txt')