import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { atualizarItem, deletarItens, getEstoque, getValorTotal } from "../../api";

interface Item {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
}

export default function Index() {
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [nome, setNome] = useState('')
  const [qtd, setQtd] = useState('')
  const [valor, setValor] = useState('')
  const [lista, setLista] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [ordenacao, setOrdenacao] = useState({ campo: 'nome', crescente: true });

  const ordenarPor = (campo: string) => {
    // 1. Faz a cópia
    const novaLista = [...lista];

    // Se clicar no mesmo campo, inverte. Se for campo novo, começa como crescente.
    const novaDirecao = ordenacao.campo === campo ? !ordenacao.crescente : true;

    // 2. Aplica a regra de ordenação
    novaLista.sort((a, b) => {
        const valA = a[campo];
        const valB = b[campo];

        if (novaDirecao) {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });

    // 3. Atualiza a tela e inverte a seta para o próximo clique
    setLista(novaLista);
    setOrdenacao({ campo: campo, crescente: novaDirecao });
  };

  const camposInvalidos = 
    !nome.trim() || 
    !qtd.toString().trim() ||
    !valor.toString().trim() ||
    parseFloat(valor) <= 0 || 
    parseInt(qtd) <= 0 || 
    isNaN(parseFloat(valor));

  const renderItem = ({ item, index } : {item: any, index: number}) => {
    const isSelecionado = selecionados.includes(item.id);
    return (
      <View key={item.id} style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow, {backgroundColor: isSelecionado ? '#d0e8ff' : 'transparent'}]}>
            <Ionicons name={isSelecionado ? "checkbox-outline" : "square-outline"} size={24} color={isSelecionado ? "#007AFF" : "#ccc"} marginRight={5} onPress={() => toggleSelecionado(item.id)} />
            <TouchableOpacity onPress={() => {setEditModalVisible(true); setIdEdit(item.id); setNome(item.nome); setQtd(item.quantidade.toString()); setValor(item.preco.toString())}} style={{ flex: 1, flexDirection: 'row' }} >
              <Text style={[styles.cell, { flex: 2 }]}>{item.nome}</Text>
              <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>{item.quantidade}</Text>
              <Text style={[styles.cell, { flex: 2, textAlign: 'right' }]}>
                R$ {parseFloat(item.preco).toFixed(2)}
              </Text>
            </TouchableOpacity>            
          </View>
    );
  }

  const goToCadastroPage = () => {
    router.push('/cadastro-itens');
  }

  const toggleSelecionado = (id: number) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  }

  const selecionarTudo = () => {
    if (selecionados.length === lista.length) {
      setSelecionados([]);
    } else {
      const todosIds = lista.map(item => item.id);
      setSelecionados(todosIds);
    }
  };

  const confirmarDelete = async () => {
    try {
      await deletarItens(selecionados);
      await atualizarLista();
      setSelecionados([]);
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Erro ao deletar itens:', error);
    }
  };

  const confirmarEdit = async () => {
    try {
      const itemAtualizado: Item = {
        id: idEdit!,
        nome: nome,
        quantidade: parseInt(qtd),
        preco: parseFloat(valor)
      };
      await atualizarItem(itemAtualizado);
      await atualizarLista();
      setSelecionados([]);
      setEditModalVisible(false);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
    }
  };


  const atualizarLista = async () => {
    setRefresh(true);

    await carregarDados();
    await carregarValorTotal();

    setRefresh(false);
  };

  const carregarDados = async () => {
    try {
      const todosOsDados = await getEstoque();
      setLista(todosOsDados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarValorTotal = async () => {
    try {
      const valorTotal = await getValorTotal();
      setTotal(valorTotal);
    } catch (error) {
      console.error('Erro ao carregar valor total:', error);
    }
  };

  useEffect(() => {
    carregarValorTotal();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estoque</Text>
      <View style={[styles.row, styles.header]}>
        <TouchableOpacity onPress={selecionarTudo}>
          <Ionicons name={selecionados.length === lista.length ? "checkbox-outline" : "square-outline"} size={24} color={selecionados.includes(lista.length) ? "#007AFF" : "#ccc"} marginRight={5} />
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 2 }} onPress={() => ordenarPor('nome')}>
          <Text style={[styles.cell, { fontWeight: 'bold' }]}>Item {ordenacao.campo === 'nome' ? (ordenacao.crescente ? '▲' : '▼') : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => ordenarPor('quantidade')}>
          <Text style={[styles.cell, { fontWeight: 'bold', textAlign: 'center' }]}>Qtd {ordenacao.campo === 'quantidade' ? (ordenacao.crescente ? '▲' : '▼') : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 2 }} onPress={() => ordenarPor('preco')}>
          <Text style={[styles.cell, { fontWeight: 'bold', textAlign: 'right' }]}>Preço {ordenacao.campo === 'preco' ? (ordenacao.crescente ? '▲' : '▼') : ''}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={lista}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        extraData={selecionados}
      />
      <ScrollView refreshControl={
        <RefreshControl refreshing={refresh} onRefresh={atualizarLista} />
      }>
      </ScrollView>
      {selecionados.length > 0 && (
        <View style={styles.deleteOverlay}>
          <TouchableOpacity style={styles.modalDelete} onPress={() => setDeleteModalVisible(true)}>
            <Ionicons name="trash-outline" style={styles.deleteText}/>
            <Text style={styles.deleteText}>{selecionados.length}</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={goToCadastroPage}>
          <Ionicons name="add-outline" size={40} color="#fff"/>
        </TouchableOpacity>
        <Text style={styles.footerText}>Patrimônio Total:</Text>
        <Text style={styles.footerTotal}>R$ {total.toFixed(2)}</Text>
      </View>
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ padding: 20, fontSize: 16, textAlign: 'center'}}>Tem certeza que deseja excluir {selecionados.length} item(s)?</Text>
            <View style={styles.horizontalDivider} />
            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-around', width: '100%'}}>
              <TouchableOpacity style={styles.modalButton} onPress={() => { confirmarDelete()}}>
                <Text style={{fontWeight: 'bold'}}>Sim</Text>
              </TouchableOpacity>
              <View style={styles.verticalDivider} />
              <TouchableOpacity style={styles.modalButton} onPress={() => { setDeleteModalVisible(false)}}>
                <Text style={{fontWeight: 'bold'}}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ padding: 20, fontSize: 16, textAlign: 'center', fontWeight: 'bold'}}>Editar Item</Text>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome:</Text>
                <TextInput style={styles.editInput} value={nome} onChangeText={setNome} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Quantidade:</Text>
                <TextInput style={styles.editInput} keyboardType="numeric" value={qtd} onChangeText={setQtd} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor:</Text>
                <TextInput style={styles.editInput} keyboardType="numeric" value={valor} onChangeText={setValor} />
              </View>
              <View style={styles.horizontalDivider} />
              <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-around', width: '100%'}}>
              <TouchableOpacity style={[styles.modalButton, {opacity: camposInvalidos ? 0.3 : 1}]} onPress={() => { confirmarEdit()}} disabled={camposInvalidos}>
                <Text style={{fontWeight: 'bold'}}>Sim</Text>
              </TouchableOpacity>
              <View style={styles.verticalDivider} />
              <TouchableOpacity style={styles.modalButton} onPress={() => { setEditModalVisible(false)}}>
                <Text style={{fontWeight: 'bold'}}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff', 
    paddingTop: 50 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  row: { 
    flexDirection: 'row', 
    paddingVertical: 10, 
    paddingHorizontal: 5, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc' 
  },
  header: { 
    backgroundColor: '#f0f0f0', 
    borderTopWidth: 1, 
    borderTopColor: '#ccc' 
  },
  evenRow: { 
    backgroundColor: '#ffffff' 
  },
  oddRow: { 
    backgroundColor: '#f9f9f9' 
  },
  cell: { 
    fontSize: 20 
  },
  footer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  footerTotal: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '900' 
  },
  button: {
    position: 'absolute',
    bottom: 80,
    right: 10,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  deleteOverlay: {
    bottom: 90,
    alignItems: 'center',
  },
  modalDelete: {
    position: 'absolute',
    borderRadius: 15,
    backgroundColor: '#be0000',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  deleteText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  modalButton: {
    height: 50, 
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
  },
  editInput: {
    width: '85%',
    height: 50,
    borderColor: '#e2e2e2',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  label: {
    fontWeight: 'bold', 
    marginBottom: 5,
    textAlign: 'left',
    width: '85%',
  },
  inputGroup: {
    width: '100%',
    alignItems: 'center',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#eee',
    width: 'auto',
    marginHorizontal: -20,
    marginTop: 10,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#eee',
    height: '100%',
    marginHorizontal: -20,
  },
});