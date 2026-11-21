export const CUSTOMER_TARGET = {
  id: "clientes-normalizados",
  name: "Clientes normalizados",
  description:
    "Un JSON con identificador, nombre, fecha de alta, estado en palabras y saldo en unidades.",
  fields: [
    { key: "customerId", label: "Identificador", hint: "El código único del cliente." },
    { key: "fullName", label: "Nombre completo", hint: "Cómo aparece el cliente en el sistema nuevo." },
    { key: "openedAt", label: "Fecha de alta", hint: "Día en que se abrió la cuenta." },
    { key: "status", label: "Estado de la cuenta", hint: "El significado del código, no el número." },
    { key: "balance", label: "Saldo", hint: "Importe en unidades, con decimales." },
  ],
};

const ALIASES = {
  customerId: ["cliente_id", "id_cliente", "customer_id", "id", "codigo"],
  fullName: ["nombre", "nombre_completo", "name", "full_name", "cliente"],
  openedAt: ["fecha_alta", "fecha", "opened_at", "alta", "fecha_apertura"],
  status: ["estado", "status", "cod_estado", "codigo_estado"],
  balance: ["saldo_centavos", "saldo", "balance", "monto", "importe"],
};

export function suggestMappings(headers, target) {
  const used = new Set();

  return target.fields.map((field) => {
    const aliases = ALIASES[field.key] ?? [];
    const match = headers.find((header) => {
      if (used.has(header)) return false;
      const normalized = header.trim().toLowerCase();
      return aliases.includes(normalized) || normalized === field.key.toLowerCase();
    });

    if (match) used.add(match);
    return { targetKey: field.key, sourceColumn: match ?? null };
  });
}
