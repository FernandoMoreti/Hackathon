type ChatInputProps = {
  text: string;                      
  onChange: (val: string) => void;   
  onSend: () => void;          
};

export default function ChatInput({ text, onChange, onSend }: ChatInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value); 
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSend(); 
    }
  };

  return (
    <input
      className="flex-1 bg-white resize-none border border-gray-300 rounded-xl p-2 focus:outline-none text-black"
      placeholder="Digite uma mensagem"
      value={text}
      onChange={handleChange}
      onKeyDown={handleKeyPress}
    />
  );
}
