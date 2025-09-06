from flask import Flask, request, jsonify, session
from flask_cors import CORS
import cohere

app = Flask(__name__)
CORS(app)

# Secret key for Flask session (needed for memory)
app.secret_key = "super_secret_key"  

co = cohere.Client("7N19QvqFe1N858Vv0QOsKrPWurzjk6tiRlrirdgG")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    # Initialize conversation history in session
    if "history" not in session:
        session["history"] = []

    # Add user message to history
    session["history"].append(f"User: {user_message}")

    # Build conversation context
    system_prompt = "You are a Software engineer who has a self deprecaitng humor and only say a sentence."
    conversation = system_prompt + "\n" + "\n".join(session["history"]) + "\n"

    # Call Cohere generate
    response = co.generate(
        model="command-r-plus-08-2024",
        prompt=conversation,
        max_tokens=50,
        temperature=0.9,
    )

    bot_reply = response.generations[0].text.strip()

    # Add bot reply to history
    session["history"].append(f" {bot_reply}")

    return jsonify({"reply": bot_reply})

@app.route("/reset", methods=["POST"])
def reset():
    """Clear conversation memory"""
    session.pop("history", None)
    return jsonify({"message": "Conversation reset."})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
