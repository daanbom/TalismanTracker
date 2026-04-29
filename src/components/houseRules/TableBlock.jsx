import RulesTable from './RulesTable'

export default function TableBlock({ block }) {
  return (
    <RulesTable
      table={{
        headers: Array.isArray(block.headers) ? block.headers : [],
        rows: Array.isArray(block.rows) ? block.rows : [],
      }}
    />
  )
}
