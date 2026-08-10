import React from "react";
import CustomerDocumentsPanel from "../CustomerDocumentsPanel.jsx";

/**
 * CustomerDocumentsTab
 * Props:
 * - customer (object)
 */
export default function CustomerDocumentsTab({ customer }) {
  return (
    <CustomerDocumentsPanel
      documents={customer.documents || []}
      photo={customer.photo}
    />
  );
}
