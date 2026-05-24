import sys
from inference import MLEngine

engine = MLEngine()
print("Raju Lassi:", engine.categorize_transaction("UPI/DR/D122101545583/Raju Lassi"))
print("Deep Tea:", engine.categorize_transaction("UPI/DR/D123123123/Deep Tea"))
