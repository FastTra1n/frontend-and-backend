import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import "./AuthModal.css";

function AuthModal({ mode, setMode, isOpen, onClose, onSubmit }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    useEffect(() => {
      if (!isOpen) return;
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
    }, [isOpen]);

  if (!isOpen) return null;

  const title = mode === "authorization" ? "Авторизация" : "Регистрация";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (firstName.length > 20) {
      alert("Имя слишком длинное.");
      return;
    }
    if (lastName.length > 20) {
      alert("Фамилия слишком длинная.");
      return;
    }
    
    if (mode === "registration") {
      onSubmit({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password,
      });
    } else {
      onSubmit({
        email: email.trim(),
        password: password,
      });
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-content__title">{title}</h2>
        <form className="modal-content__form" onSubmit={handleSubmit}>
          {mode === "registration" && (
            <>
              <label htmlFor="firstName">Имя</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <label htmlFor="lastName">Фамилия</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </>
          )}
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn-form">
            {mode === "authorization" ? "Войти" : "Создать аккаунт"}
          </button>

          <input
            type="button"
            value={
              mode === "authorization"
                ? "Создать аккаунт"
                : "Войти в аккаунт"
            }
            onClick={() =>
              setMode(
                mode !== "registration"
                  ? "registration"
                  : "authorization",
              )
            }
          />
        </form>
        <button onClick={onClose} className="modal-close-button">
          Х
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default AuthModal;
