// Preset Code Templates for Multi-Language SAST and Security Demonstrations

export const CODE_TEMPLATES = [
  {
    id: "py-sqli",
    name: "Python (Flask) - SQL Injection & Hardcoded Keys",
    language: "python",
    category: "SQL Injection & Secrets",
    code: `from flask import Flask, request
import sqlite3
import os

app = Flask(__name__)
# VULNERABILITY: Hardcoded Secret Key
AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE"
JWT_SECRET = "super_secret_jwt_token_12345"

@app.route('/user_profile', methods=['GET'])
def get_user_profile():
    username = request.args.get('username')
    
    # VULNERABILITY: SQL Injection via String Concatenation
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    query = "SELECT id, email, role, balance FROM users WHERE username = '" + username + "'"
    cursor.execute(query)
    
    user_data = cursor.fetchone()
    return {"user": user_data}

@app.route('/run_backup', methods=['POST'])
def run_backup():
    filename = request.form.get('filename')
    # VULNERABILITY: Command Injection
    os.system("tar -czf backup.tar.gz /var/www/" + filename)
    return "Backup Initiated"`
  },
  {
    id: "js-xss",
    name: "React / JS - DOM XSS & DangerouslySetInnerHTML",
    language: "javascript",
    category: "Cross-Site Scripting (XSS)",
    code: `import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function UserComments({ userComment, targetUrl }) {
  const [comments, setComments] = useState([]);
  
  // VULNERABILITY: Hardcoded API key
  const STRIPE_SECRET = "sk_test_placeholder_key_for_demo_only";

  const fetchRemoteData = async () => {
    // VULNERABILITY: Server-Side Request Forgery (SSRF) risk
    const res = await axios.get(targetUrl);
    setComments(res.data);
  };

  return (
    <div className="comment-box">
      <h2>User Submitted Reviews</h2>
      
      {/* VULNERABILITY: DOM XSS via dangerouslySetInnerHTML without sanitization */}
      <div 
        className="rendered-html"
        dangerouslySetInnerHTML={{ __html: userComment }} 
      />
      
      <button onClick={fetchRemoteData}>Fetch Feed</button>
    </div>
  );
}`
  },
  {
    id: "node-rce",
    name: "Node.js (Express) - Remote Code Execution & Eval",
    language: "javascript",
    category: "Remote Code Execution (RCE)",
    code: `const express = require('express');
const { exec, execSync } = require('child_process');
const app = express();

app.use(express.json());

// VULNERABILITY: Hardcoded JWT Secret
const JWT_SECRET_KEY = "my_hardcoded_jwt_secret_token_key";

app.post('/api/calculate', (req, res) => {
  const { expression } = req.body;
  
  // VULNERABILITY: Dynamic Code Evaluation (RCE via eval)
  try {
    const result = eval(expression);
    res.json({ result });
  } catch (err) {
    res.status(400).json({ error: "Invalid math expression" });
  }
});

app.post('/api/ping', (req, res) => {
  const { host } = req.body;
  
  // VULNERABILITY: Unsanitized Shell Command Execution
  exec(\`ping -c 3 \${host}\`, (error, stdout, stderr) => {
    if (error) return res.status(500).send(stderr);
    res.send(stdout);
  });
});`
  },
  {
    id: "docker-sec",
    name: "Dockerfile - Privileged Root & Exposed ENV Secrets",
    language: "dockerfile",
    category: "Container Security",
    code: `# Production Dockerfile
FROM node:18-alpine

WORKDIR /app

# VULNERABILITY: Exposing sensitive credentials in Docker environment layer
ENV DATABASE_PASSWORD="SuperSecretRootDBPassword2026!"
ENV AWS_ACCESS_KEY_ID="AKIAEXAMPLE12345678"

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# VULNERABILITY: Running container default process as privileged root user
# Missing: USER node / non-root user
CMD ["npm", "start"]`
  },
  {
    id: "py-deser",
    name: "Python - Insecure Deserialization & Path Traversal",
    language: "python",
    category: "Insecure Deserialization & File Traversal",
    code: `import pickle
import os
from flask import Flask, request

app = Flask(__name__)

@app.route('/load_session', methods=['POST'])
def load_session():
    raw_data = request.data
    # VULNERABILITY: Insecure Deserialization using pickle
    session_object = pickle.loads(raw_data)
    return {"status": "success", "user": session_object.name}

@app.route('/read_log', methods=['GET'])
def read_log():
    file_path = request.args.get('path')
    # VULNERABILITY: Path Traversal without sanitization
    with open("/var/log/app/" + file_path, 'r') as f:
        content = f.read()
    return content`
  }
];
