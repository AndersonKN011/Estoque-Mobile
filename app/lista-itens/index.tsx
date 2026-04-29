import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { deletarItens, getEstoque, getValorTotal } from "../../api";

export default function Segunda() {
  const [lista, setLista] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

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

  const confirmarDelecao = async () => {
    try {
      await deletarItens(selecionados);
      await atualizarLista();
      setSelecionados([]);
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao deletar itens:', error);
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
        <Text style={[styles.cell, { fontWeight: 'bold' }]}></Text>
        <Text style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}>Item</Text>
        <Text style={[styles.cell, { flex: 1, fontWeight: 'bold', textAlign: 'center' }]}>Qtd</Text>
        <Text style={[styles.cell, { flex: 1.5, fontWeight: 'bold', textAlign: 'right' }]}>Preço</Text>
      </View>

      <ScrollView refreshControl={
        <RefreshControl refreshing={refresh} onRefresh={atualizarLista} />
      }>
        {lista.map((item, index) => (
          <View key={item.id} style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow, {backgroundColor: selecionados.includes(item.id) ? '#d0e8ff' : 'transparent'}]}>
            <Ionicons name={selecionados.includes(item.id) ? "checkbox-outline" : "square-outline"} size={24} color={selecionados.includes(item.id) ? "#007AFF" : "#ccc"} marginRight={5} onPress={() => toggleSelecionado(item.id)} />
            <Text style={[styles.cell, { flex: 2 }]}>{item.nome}</Text>
            <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>{item.quantidade}</Text>
            <Text style={[styles.cell, { flex: 2.5, textAlign: 'right' }]}>
              R$ {parseFloat(item.preco).toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>
      {selecionados.length > 0 && (
        <View style={styles.deleteOverlay}>
          <TouchableOpacity style={styles.modalDelete} onPress={() => setModalVisible(true)}>
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
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={{ padding: 20, fontSize: 16, textAlign: 'center'}}>Tem certeza que deseja excluir {selecionados.length} item(s)?</Text>
            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-around', width: '100%'}}>
              <TouchableOpacity style={styles.deleteModalButton} onPress={() => { confirmarDelecao()}}>
                <Text style={{fontWeight: 'bold'}}>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteModalButton} onPress={() => { setModalVisible(false)}}>
                <Text style={{fontWeight: 'bold'}}>Cancelar</Text>
              </TouchableOpacity>
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
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  deleteModalContent: {
    top: '50%',
    marginTop: -100,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    margin: 50,
    alignItems: 'center',
  },
  deleteModalButton: {
    height: 50, 
    width: '50%', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
});