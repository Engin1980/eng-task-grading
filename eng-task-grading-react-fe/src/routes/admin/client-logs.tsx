import { createFileRoute } from '@tanstack/react-router'
import { senderRulesHandler, LogLevels } from '../../services/log-service';
import type { LogLevel } from '../../services/log-service';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/admin/client-logs')({
  component: RouteComponent,
})

function RouteComponent() {
  const [rules, setRules] = useState(senderRulesHandler.getRules());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPattern, setEditPattern] = useState('');
  const [editLevel, setEditLevel] = useState<LogLevel>(LogLevels.info);
  const [newPattern, setNewPattern] = useState('');
  const [newLevel, setNewLevel] = useState<LogLevel>(LogLevels.info);

  useEffect(() => {
    senderRulesHandler.loadFromStorage();
    setRules(senderRulesHandler.getRules());
  }, []);

  const handleLoad = () => {
    senderRulesHandler.loadFromStorage();
    setRules(senderRulesHandler.getRules());
  };

  const handleSave = () => {
    senderRulesHandler.saveToStorage();
    alert('Uloženo');
  };

  const handleDelete = () => {
    if (confirm('Opravdu smazat všechna pravidla?')) {
      senderRulesHandler.deleteFromStorage();
      senderRulesHandler.setDefaults();
      setRules(senderRulesHandler.getRules());
    }
  };

  const handleEdit = (index: number, pattern: string, level: LogLevel) => {
    setEditingIndex(index);
    setEditPattern(pattern);
    setEditLevel(level);
  };

  const handleSaveEdit = (index: number) => {
    senderRulesHandler.deleteRuleAt(index);
    senderRulesHandler.insertRule(editPattern, editLevel, index);
    setRules(senderRulesHandler.getRules());
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditPattern('');
    setEditLevel(LogLevels.info);
  };

  const handleAddRule = () => {
    if (!newPattern.trim()) {
      alert('Pattern cannot be empty');
      return;
    }
    senderRulesHandler.addRule(newPattern, newLevel);
    setRules(senderRulesHandler.getRules());
    setNewPattern('');
    setNewLevel(LogLevels.info);
  };

  const handleAddRuleFirst = () => {
    if (!newPattern.trim()) {
      alert('Pattern cannot be empty');
      return;
    }
    senderRulesHandler.insertRule(newPattern, newLevel, 0);
    setRules(senderRulesHandler.getRules());
    setNewPattern('');
    setNewLevel(LogLevels.info);
  };

  const handleDeleteRule = (index: number) => {
    if (confirm('Delete this rule?')) {
      senderRulesHandler.deleteRuleAt(index);
      setRules(senderRulesHandler.getRules());
    }
  };

  const handleMoveFirst = (index: number) => {
    senderRulesHandler.moveRuleToIndex(index, 0);
    setRules(senderRulesHandler.getRules());
  };

  const handleMoveLast = (index: number) => {
    senderRulesHandler.moveRuleToIndex(index, rules.length - 1);
    setRules(senderRulesHandler.getRules());
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      senderRulesHandler.moveRuleToIndex(index, index - 1);
      setRules(senderRulesHandler.getRules());
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < rules.length - 1) {
      senderRulesHandler.moveRuleToIndex(index, index + 1);
      setRules(senderRulesHandler.getRules());
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Client Log Rules</h1>
      
      <div className="mb-4 flex gap-2">
        <button onClick={handleLoad} className="px-4 py-2 bg-blue-500 text-white rounded">
          Load
        </button>
        <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded">
          Save
        </button>
        <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">
          Delete
        </button>
      </div>

      <div className="mb-4 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Add New Rule</h2>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm mb-1">Pattern (RegExp)</label>
            <input
              type="text"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="e.g., \.tsx or Service or .*"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Log Level</label>
            <select
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value as LogLevel)}
              className="border p-2 rounded"
            >
              <option value={LogLevels.debug}>debug</option>
              <option value={LogLevels.info}>info</option>
              <option value={LogLevels.warn}>warn</option>
              <option value={LogLevels.error}>error</option>
            </select>
          </div>
          <button
            onClick={handleAddRule}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add
          </button>
          <button
            onClick={handleAddRuleFirst}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Add First
          </button>
        </div>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">#</th>
            <th className="border p-2 text-left">Pattern</th>
            <th className="border p-2 text-left">Level</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, index) => (
            <tr key={index}>
              <td className="border p-2 text-gray-500">{index}</td>
              <td className="border p-2 font-mono">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editPattern}
                    onChange={(e) => setEditPattern(e.target.value)}
                    className="border p-1 w-full"
                  />
                ) : (
                  rule.pattern.source
                )}
              </td>
              <td className="border p-2">
                {editingIndex === index ? (
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value as LogLevel)}
                    className="border p-1"
                  >
                    <option value={LogLevels.debug}>debug</option>
                    <option value={LogLevels.info}>info</option>
                    <option value={LogLevels.warn}>warn</option>
                    <option value={LogLevels.error}>error</option>
                  </select>
                ) : (
                  <span className={`font-semibold ${
                    rule.level === LogLevels.error ? 'text-red-600' :
                    rule.level === LogLevels.warn ? 'text-yellow-600' :
                    rule.level === LogLevels.info ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {rule.level}
                  </span>
                )}
              </td>
              <td className="border p-2">
                {editingIndex === index ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 bg-gray-500 text-white rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => handleEdit(index, rule.pattern.source, rule.level)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRule(index)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Del
                    </button>
                    <button
                      onClick={() => handleMoveFirst(index)}
                      disabled={index === 0}
                      className="px-2 py-1 bg-purple-500 text-white rounded text-xs disabled:bg-gray-300"
                      title="Move to first"
                    >
                      ⇈
                    </button>
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="px-2 py-1 bg-purple-500 text-white rounded text-xs disabled:bg-gray-300"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === rules.length - 1}
                      className="px-2 py-1 bg-purple-500 text-white rounded text-xs disabled:bg-gray-300"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleMoveLast(index)}
                      disabled={index === rules.length - 1}
                      className="px-2 py-1 bg-purple-500 text-white rounded text-xs disabled:bg-gray-300"
                      title="Move to last"
                    >
                      ⇊
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}