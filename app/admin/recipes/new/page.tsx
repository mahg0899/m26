"use client";

import LoginGate from "../../LoginGate";
import AdminShell from "../../AdminShell";
import RecipeEditor from "../../RecipeEditor";
import "./editor.css";

export default function NewRecipePage() {
  return (
    <LoginGate>
      <AdminShell>
        <RecipeEditor mode="create" />
      </AdminShell>
    </LoginGate>
  );
}
