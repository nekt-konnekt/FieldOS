import {useEffect,useState} from "react";
import {SafeAreaView,Text,View,Pressable,FlatList,StyleSheet} from "react-native";
import type {LocalTask} from "../lib/db";
import {initDb,queueStatusChange,readTasks} from "../lib/db";
import {pullTasks,syncPending} from "../lib/sync";

export default function Home(){
 const [tasks,setTasks]=useState<LocalTask[]>([]);
 const [syncing,setSyncing]=useState(false);
 const refresh=async()=>{await initDb();try{await syncPending();await pullTasks()}catch{}setTasks(await readTasks())};
 useEffect(()=>{void refresh()},[]);
 const change=async(task:LocalTask,status:string)=>{await queueStatusChange(task.id,status);setTasks(await readTasks());setSyncing(true);try{await syncPending();await pullTasks()}catch{}finally{setSyncing(false);setTasks(await readTasks())}};
 return <SafeAreaView style={styles.safe}><View style={styles.container}>
  <Text style={styles.brand}>FieldOS</Text><Text style={styles.title}>My field work</Text><Text style={styles.sub}>{syncing?"Syncing...":"Works offline. Pending changes sync when connected."}</Text>
  <Pressable style={styles.refresh} onPress={()=>void refresh()}><Text>Refresh / Sync</Text></Pressable>
  <FlatList data={tasks} keyExtractor={x=>x.id} ListEmptyComponent={<Text style={styles.empty}>No assigned tasks.</Text>} renderItem={({item})=><View style={styles.card}><Text style={styles.task}>{item.title}</Text><Text style={styles.status}>{item.status}</Text>{item.status==="assigned"&&<Pressable onPress={()=>void change(item,"in_progress")} style={styles.button}><Text>Start task</Text></Pressable>}{item.status==="in_progress"&&<Pressable onPress={()=>void change(item,"completed")} style={styles.button}><Text>Complete</Text></Pressable>}</View>}/>
 </View></SafeAreaView>
}
const styles=StyleSheet.create({safe:{flex:1},container:{flex:1,padding:24},brand:{fontSize:13,fontWeight:"800",letterSpacing:1},title:{fontSize:28,fontWeight:"700",marginTop:8},sub:{color:"#667085",marginTop:6,marginBottom:16},refresh:{padding:12,borderWidth:1,borderColor:"#ddd",borderRadius:8,alignSelf:"flex-start",marginBottom:16},card:{padding:16,borderWidth:1,borderColor:"#ddd",borderRadius:10,marginBottom:10},task:{fontSize:16,fontWeight:"700"},status:{marginVertical:8,color:"#667085"},button:{padding:10,borderWidth:1,borderColor:"#ccc",borderRadius:8,alignSelf:"flex-start"},empty:{color:"#667085",marginTop:30}});
