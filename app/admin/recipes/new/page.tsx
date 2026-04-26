"use client";

import LoginGate from "../../LoginGate";
import RecipeEditor from "../../RecipeEditor";
import "./editor.css";

export default function NewRecipePage() {
  return (
    <LoginGate>
      <RecipeEditor mode="create" />
    </LoginGate>
  );
}
