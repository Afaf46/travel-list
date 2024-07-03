import { useState, useEffect } from "react";

export default function App() {
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem("items");
    return savedItems ? JSON.parse(savedItems) : [];
  });

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  function handleAddItem(item) {
    setItems((items) => [...items, item]);
  }

  function handleDelete(id) {
    setItems((items) => items.filter((item) => item.id !== id));
  }

  function onToggle(id) {
    setItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  }

  function onClear() {
    setItems([]);
  }

  return (
    <div className="app">
      <Titles />
      <Form addItems={handleAddItem} />
      <Packlists
        items={items}
        onDelete={handleDelete}
        onToggleItem={onToggle}
        clear={onClear}
      />
      <Stats items={items} />
    </div>
  );
}

function Titles() {
  return <h1>Travel List</h1>;
}

function Form({ addItems }) {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!description) {
      setError("You must add an item description.");
      return;
    }

    setError(""); // Clear the error message if description is provided
    const newItem = { description, quantity, packed: false, id: Date.now() };
    addItems(newItem);

    setDescription("");
    setQuantity(1);
  }

  function handleDescriptionChange(e) {
    const value = e.target.value;
    if (/^[^0-9]*$/.test(value)) {
      // Allow only non-numeric characters
      setDescription(value);
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>What do you need for your trip?</h3>
      <label htmlFor="quantity">Quantity:</label>
      <select
        id="quantity"
        onChange={(e) => setQuantity(+e.target.value)}
        value={quantity}
        aria-label="Select quantity"
      >
        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
          <option value={num} key={num}>
            {num}
          </option>
        ))}
      </select>
      <label htmlFor="description">Item:</label>
      <input
        id="description"
        type="text"
        placeholder="..item"
        value={description}
        onChange={handleDescriptionChange}
        aria-label="Item description"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Add</button>
    </form>
  );
}

function Packlists({ items, onDelete, onToggleItem, clear }) {
  const [sortBy, setSortBy] = useState("input");

  let sortedItems;
  if (sortBy === "input") sortedItems = items;
  if (sortBy === "description")
    sortedItems = items
      .slice()
      .sort((a, b) => a.description.localeCompare(b.description));
  if (sortBy === "packed")
    sortedItems = items
      .slice()
      .sort((a, b) => Number(a.packed) - Number(b.packed));

  return (
    <div className="list">
      <ul>
        {sortedItems.map((item) => (
          <Item
            item={item}
            onDelete={onDelete}
            onToggleItem={onToggleItem}
            key={item.id}
          />
        ))}
      </ul>

      <div className="actions">
        <label htmlFor="sort">Sort by:</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort by"
        >
          <option value="input">Sort by input</option>
          <option value="description">Sort by description</option>
          <option value="packed">Sort by packed</option>
        </select>
        <button onClick={clear} aria-label="Clear all items">
          Clear
        </button>
      </div>
    </div>
  );
}

function Item({ item, onDelete, onToggleItem }) {
  return (
    <li>
      <input
        type="checkbox"
        checked={item.packed}
        onChange={() => onToggleItem(item.id)}
        aria-label={`Mark ${item.description} as ${
          item.packed ? "not packed" : "packed"
        }`}
      />
      <span style={item.packed ? { textDecoration: "line-through" } : {}}>
        {item.quantity} {item.description}
      </span>
      <button
        onClick={() => onDelete(item.id)}
        style={{ color: "red" }}
        aria-label={`Delete ${item.description}`}
      >
        &times;
      </button>
    </li>
  );
}

function Stats({ items }) {
  if (!items.length) return <p className="stats">Start adding your list</p>;

  const numberOfItems = items.length;
  const numPacked = items.filter((item) => item.packed).length;
  return (
    <footer className="stats">
      <em>
        You have {numberOfItems} item(s) in your list, and you have packed{" "}
        {numPacked} item(s).
      </em>
    </footer>
  );
}

// CSS
const styles = `
  .error {
    color: red;
    margin-top: 5px;
  }
`;

document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);
