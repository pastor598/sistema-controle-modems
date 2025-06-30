import re
import os

def resolve_conflicts_in_file(filename):
    """Resolve conflitos de merge em um arquivo"""
    if not os.path.exists(filename):
        print(f"Arquivo {filename} não encontrado")
        return
        
    # Ler o arquivo
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Verificar se há conflitos
    if '<<<<<<< HEAD' not in content:
        print(f"Nenhum conflito encontrado em {filename}")
        return
    
    # Padrão para encontrar conflitos de merge
    pattern = r'<<<<<<< HEAD(.*?)=======(.*?)>>>>>>> [a-f0-9]+' 
    
    def resolve_conflict(match):
        head_version = match.group(1).strip()
        branch_version = match.group(2).strip()
        
        # Para CSS e JS, geralmente queremos manter a versão mais completa
        # ou a que tem mais funcionalidades
        
        # Se uma versão está vazia, usar a outra
        if not head_version:
            return branch_version
        if not branch_version:
            return head_version
            
        # Preferir versão com mais conteúdo (geralmente mais funcional)
        if len(head_version) > len(branch_version):
            return head_version
        else:
            return branch_version
    
    # Resolver todos os conflitos
    resolved_content = re.sub(pattern, resolve_conflict, content, flags=re.DOTALL)
    
    # Salvar arquivo resolvido
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(resolved_content)
    
    print(f"Conflitos resolvidos em {filename}")

# Resolver conflitos em todos os arquivos
files_to_fix = ['css/style.css', 'js/script.js']

for file in files_to_fix:
    resolve_conflicts_in_file(file)

print("\nTodos os conflitos foram resolvidos!") 