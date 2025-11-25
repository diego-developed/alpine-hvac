import { useState } from "react";

const initialForm = {
    name: "",
    phone: "",
    email: "",
    address: "",
    zip: "",
    message: "",
};

export default function RequestServiceForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateFrontend = () => {
    const errors = [];

    const name = form.name.trim();
    const phoneDigits = form.phone.replace(/\D/g, "");
    const email = form.email.trim();
    const address = form.address.trim();
    const zip = form.zip.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      errors.push("Please enter your full name.");
    }

    if (phoneDigits.length < 10) {
      errors.push("Please enter a valid phone number.");
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Please enter a valid email address.");
    }

    if (address.length < 5) {
      errors.push("Please enter a full service address.");
    }

    if (!/^[0-9]{5}$/.test(zip)) {
      errors.push("Please enter a valid 5-digit ZIP code.");
    }

    if (message.length > 1000) {
      errors.push("Message is too long.");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const errors = validateFrontend();
    if (errors.length > 0) {
      setStatus("idle");
      setError(errors.join(" "));
      return;
    }

    try {
      const res = await fetch("/api/request-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send request.");
      }

      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError(
        "Something went wrong sending your request. Please call us directly."
      );
    }
  };

  return (
    <form className="request-form" onSubmit={handleSubmit} id="request-service">
      <h2 className="request-form__title">Request Service</h2>
      <p className="request-form__subtitle">
        Tell us a bit about the issue and we'll get back to you ASAP.
      </p>

      <div className="request-form__row">
        <label className="request-form__field">
          Name*
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label className="request-form__field">
          Phone*
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div className="request-form__row">
        <label className="request-form__field">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </label>
        <label className="request-form__field">
          ZIP Code*
          <input
            type="text"
            name="zip"
            value={form.zip}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <label className="request-form__field">
        Address*
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          required
        />
      </label>

      <label className="request-form__field">
        Describe the issue
        <textarea
          name="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          placeholder="Example: AC not cooling, strange noise from outdoor unit, no heat from vents, etc."
        />
      </label>

      {error && <p className="request-form__error">{error}</p>}
      {status === "success" && (
        <p className="request-form__success">
          Thanks! Your request was sent. We’ll reach out shortly.
        </p>
      )}

      <button
        type="submit"
        className="request-form__button"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending..." : "Request Service"}
      </button>
    </form>
  );
}