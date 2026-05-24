from inference import MLEngine
engine = MLEngine()
print("Whole Foods:", engine.categorize_transaction("WHOLE FOODS MARKET"))
print("Swiss Bank:", engine.categorize_transaction("PAYPAL TRANSFER TO SWISS BANK"))
