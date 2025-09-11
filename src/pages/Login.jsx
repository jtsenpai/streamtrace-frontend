import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState("");
  const { login } = useAuth();
}
