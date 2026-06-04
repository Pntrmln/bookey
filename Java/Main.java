import java.awt.*;
import java.awt.event.ActionEvent;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;

import javax.swing.*;
import com.toedter.calendar.JDateChooser;
import java.awt.event.ItemEvent;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.swing.event.TableModelEvent;
import javax.swing.event.TableModelListener;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.TableColumnModel;

class gui extends JFrame {

    static JFrame frame;
    static JComboBox<String> c;
    static JButton b, b2, torles;
    static String strVendegOszlopok;
    static int iSzobaOszlopok;
    static String[] arrSzobak;
    static Connection conn;
    static Statement st;
    static ResultSet rs;
    static ArrayList<String> mezoNevek;
    static JDateChooser bejelentkezes, kijelentkezes;
    static ArrayList<java.util.Date> bejelentkezesek;
    static ArrayList<java.util.Date> kijelentkezesek;
    static JTextField torlesID;
    static Font joFont;
    
    interface Bevitel {
            void getFoglalasok();
        }

    void bevitel() throws SQLException, FontFormatException, IOException {

        frame = new JFrame();

        frame.setTitle("bk_admin");
        frame.setSize(600, 400);
        frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        frame.setResizable(false);
        frame.setLocationRelativeTo(null);
 
        JTabbedPane tabs = new JTabbedPane();

        GridBagLayout gb = new GridBagLayout();
        GridBagConstraints gbc = new GridBagConstraints();

        BorderLayout bl = new BorderLayout();
    
        JPanel BevitelTab = new JPanel();

        JPanel bevitelMezoPanel = new JPanel(gb);
        JPanel bevitelGombPanel = new JPanel();

        BevitelTab.setLayout(bl);

        gbc.weightx = 0.2;
        gbc.fill = GridBagConstraints.HORIZONTAL;

        int ivendegOszlopok = Integer.parseInt(strVendegOszlopok);

        ArrayList<JTextField> taLista = new ArrayList<>();

        InputStream is = gui.class.getResourceAsStream("/FunnelDisplay-Regular.ttf");
        Font joFont = Font.createFont(Font.TRUETYPE_FONT, is).deriveFont(14f);

        if (is == null) {
            System.out.println(0);
        }
   
        for (int i = 0; i < ivendegOszlopok-3; i++){
            gbc.gridy = i;
            JTextField tf = new JTextField();
            tf.setPreferredSize(new Dimension(25,30));
            tf.setName(mezoNevek.get(i));
            taLista.add(tf);
            bevitelMezoPanel.add(tf,gbc);
        }
        taLista.get(3).setEditable(false);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        bejelentkezes = new JDateChooser();
        bejelentkezes.setDate(new java.util.Date());
        bejelentkezes.setEnabled(false);
        bejelentkezes.setPreferredSize(taLista.get(0).getPreferredSize());
        bejelentkezes.setName("vendegek.bejelentkezes");

        kijelentkezes = new JDateChooser();
        kijelentkezes.setDate(new java.util.Date());
        kijelentkezes.setEnabled(false);
        kijelentkezes.setPreferredSize(taLista.get(0).getPreferredSize());
        kijelentkezes.setName("vendegek.kijelentkezes");

        
        gbc.gridy += 1;
        bevitelMezoPanel.add(bejelentkezes,gbc);

        gbc.gridy += 1;
        bevitelMezoPanel.add(kijelentkezes,gbc);

        c = new JComboBox<>();
        c.addItem("");
        c.setPreferredSize(new Dimension(10,30));
        c.setName("szobak.nev");

        gbc.gridy += 1;
        gbc.weightx = 0;
        bevitelMezoPanel.add(c, gbc);

        for (int i = 0; i < mezoNevek.size(); i++) {
            gbc.gridx = 1;
            gbc.gridy = i;
            Label l = new Label(String.valueOf(mezoNevek.get(i)));
            bevitelMezoPanel.add(l, gbc);
        }

        JScrollPane bevitelPane = new JScrollPane(bevitelMezoPanel);
    
        BevitelTab.add(bevitelPane, BorderLayout.PAGE_START);

        for (String szobaType : arrSzobak) {
            c.addItem(szobaType);
        }

        ArrayList<Component> components = new ArrayList<>();
        for (Component comp : bevitelMezoPanel.getComponents()) {
            if(!(comp instanceof Label)) {
                components.add(comp);
            }
        }
    
        b = new JButton(String.format("Foglalás \nrögzítése"));
        b.setBackground(Color.GREEN);
        b.setPreferredSize(new Dimension(140,30));
        bevitelGombPanel.add(b, gbc);

        b2 = new JButton("Clear");
        b2.setBackground(Color.orange);
        b2.setPreferredSize(new Dimension(70,30));
        bevitelGombPanel.add(b2, gbc);

        Label status = new Label();
        bevitelGombPanel.add(status);

        BevitelTab.add(bevitelGombPanel, BorderLayout.PAGE_END);

        frame.add(BevitelTab);

        tabs.addTab("Bevitel", BevitelTab);

        BorderLayout bl2 = new BorderLayout();
        JPanel foglalasok = new JPanel(bl2);
        
        tabs.addTab("Foglalások", foglalasok);

        GridBagLayout gb2 = new GridBagLayout();
        GridBagConstraints gbc2 = new GridBagConstraints();
        JPanel szovegPanel = new JPanel(gb2);
        

        Bevitel foglalasokKiiras = () -> {
            try {
                rs = st.executeQuery("SELECT COUNT(column_name) FROM information_schema.columns WHERE table_name = 'vendegek'");
                rs.next();
                int adatSzam = rs.getInt(1);
                String[] vendegHeader = new String[adatSzam];

                rs = st.executeQuery("SELECT column_name FROM information_schema.columns WHERE table_name = 'vendegek'");

                int index = 0;
                while (rs.next()) {
                    vendegHeader[index] = rs.getString(1);
                    index++;
                }

                rs = st.executeQuery("SELECT COUNT(*) FROM vendegek");
                rs.next();
                int foglalasSzam = rs.getInt(1);

                Object[][] foglalas = new Object[foglalasSzam][adatSzam];

                rs = st.executeQuery("SELECT * FROM vendegek ORDER BY vendegid");

                for (int f = 0; f < foglalasSzam; f++) {
                    rs.next();
                    for (int a = 1; a < adatSzam+1; a++)  {
                        foglalas[f][a-1] = rs.getString(a);
                    }
                }

                JTable foglalasokTabla = new JTable(foglalas,vendegHeader);
                JScrollPane foglalasokPane = new JScrollPane(foglalasokTabla);

                foglalasokPane.setPreferredSize(new Dimension(578,300));

                foglalasokTabla.setRowHeight(45);
                foglalasokTabla.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);
                foglalasokTabla.setEnabled(false);
                foglalasokTabla.setFont(joFont);
                

                TableColumnModel tcm = foglalasokTabla.getColumnModel();
                
                DefaultTableCellRenderer dtcr = new DefaultTableCellRenderer();
                dtcr.setHorizontalAlignment(JLabel.CENTER);

                for (int s = 0; s < vendegHeader.length; s++) {
                    tcm.getColumn(s).setPreferredWidth(150);
                    tcm.getColumn(s).setCellRenderer(dtcr);
                }

                gbc2.gridy = 0;
                szovegPanel.add(foglalasokPane, gbc2);

                foglalasokTabla.getModel().addTableModelListener((TableModelEvent evt) -> {
                    System.out.println(foglalas[evt.getFirstRow()][evt.getColumn()]);
                    
                    
                });
                
                    
            } catch (SQLException f) {
                System.out.println("nem gyó " + f.getMessage());
            }
        };

        foglalasok.add(szovegPanel, BorderLayout.PAGE_START);

        JPanel torlesPanel = new JPanel();

        JTextField torlesID = new JTextField();
        torlesID.setPreferredSize(new Dimension(25,30));

        torlesPanel.add(torlesID);

        torles = new JButton("Törlés");
        torles.setBackground(Color.red);
        torles.setPreferredSize(new Dimension(70,30));

        torlesPanel.add(torles);

        foglalasok.add(torlesPanel, BorderLayout.PAGE_END);

        frame.add(tabs);
        frame.setVisible(true);


        
        tabs.addChangeListener((ChangeEvent) -> {
            szovegPanel.removeAll();
            foglalasokKiiras.getFoglalasok();

        });

        for (Component comp : bevitelMezoPanel.getComponents()) {
            comp.setFont(joFont);
        }

        c.addItemListener((ItemEvent arg0) -> {
            int szobaIndex = c.getSelectedIndex();
            szobaIndex -= 1;
            if (szobaIndex == -1) {
                taLista.get(3).setText("");
                bejelentkezes.setEnabled(false);
                kijelentkezes.setEnabled(false);
            }
            else {
                taLista.get(3).setText(String.valueOf(szobaIndex+1));
                bejelentkezes.setEnabled(true);
                kijelentkezes.setEnabled(true);
            }
        });

        b2.addActionListener((var e) -> {
            for(JTextField tf : taLista) {
                tf.setText("");
                bejelentkezes.setDate(new Date());
                kijelentkezes.setDate(new Date());
                c.setSelectedIndex(0);
            }
        });

        b.addActionListener((var e) -> {
            ArrayList<String> adatok = new ArrayList<>();
            try {
                for (int i = 0; i < taLista.size() ; i++) {
                    String adat = taLista.get(i).getText() + "";
                    adatok.add(adat);
                }
                adatok.add(sdf.format(bejelentkezes.getDate()));
                adatok.add(sdf.format(kijelentkezes.getDate()));

                boolean missingData = false;
                ArrayList<Component> hibasComponent = new ArrayList<>();

                LocalDate ma = LocalDate.now();
                
                LocalDate bj = bejelentkezes.getDate().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();

                LocalDate kj = kijelentkezes.getDate().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();

                
                rs = st.executeQuery(String.format("SELECT bejelentkezes, kijelentkezes FROM vendegek JOIN szobak ON szobak.szobaid = vendegek.szid WHERE szobak.nev = '%s'", c.getSelectedItem()));
                    
                while (rs.next()) {
                    LocalDate foglaltBJ = LocalDate.parse(rs.getString(1));
                    LocalDate foglaltKJ = LocalDate.parse(rs.getString(2));
                    if ((bj.isAfter(foglaltBJ) && bj.isBefore(foglaltKJ)) || (kj.isAfter(foglaltBJ) && kj.isBefore(foglaltKJ)) || bj.equals(foglaltBJ) && kj.equals(foglaltKJ) && bj.equals(foglaltBJ)) {
                        hibasComponent.add(bejelentkezes);
                        hibasComponent.add(kijelentkezes);
                        missingData = true;
                        break;
                    }
                }
                    
                if (bj.equals(kj) || bj.isBefore(ma) || bj.isAfter(kj) || kj.isBefore(bj) || kj.isBefore(ma)) {
                    hibasComponent.add(bejelentkezes);
                    hibasComponent.add(kijelentkezes);
                    missingData = true;
                }

                for (int j = 0; j < 3; j++){
                    String adat = adatok.get(j);
                    if (adat.length() > 0){
                        Pattern letter = Pattern.compile("[a-zA-z]");
                        Pattern digit = Pattern.compile("[0-9]");
                        Pattern special = Pattern.compile ("[!@#$%&*()_+=|<>?{}\\[\\]~-]");

                        Matcher hasLetter = letter.matcher(adat);
                        Matcher hasDigit = digit.matcher(adat);
                        Matcher hasSpecial = special.matcher(adat);
                        
                            switch (j) {
                                case 0 -> { // Név check
                                    if (hasDigit.find() || hasSpecial.find()) {
                                        hibasComponent.add(components.get(0));
                                        missingData = true;
                                    } else {
                                        components.get(0).setBackground(Color.white);
                                        components.get(0).setForeground(Color.black);
                                    }
                                }
                                case 1 -> { // Telefonszám check
                                    if (hasLetter.find() || hasSpecial.find() || adat.length() != 11) {
                                        hibasComponent.add(components.get(1));
                                        missingData = true;
                                    } else {
                                        components.get(1).setBackground(Color.white);
                                        components.get(1).setForeground(Color.black);
                                    }
                                }
                                case 2 -> { // Email check
                                    if (!adat.contains("@") || !adat.contains(".") || !hasLetter.find()) {
                                        hibasComponent.add(components.get(2));
                                        missingData = true;
                                    } else {
                                        components.get(2).setBackground(Color.white);
                                        components.get(2).setForeground(Color.black);
                                    }
                                }
                            }
                        
                    } else { // Ha üres
                        hibasComponent.add(components.get(j));
                    }
                }
                if (c.getSelectedIndex() == 0) {
                    hibasComponent.add(c);
                }

                if(!missingData) {
                    for(int i = 0; i < taLista.size(); i++) {
                        taLista.get(i).setText("");
                    }
                    c.setSelectedIndex(0);
                    bejelentkezes.setDate(new java.util.Date());
                    kijelentkezes.setDate(new java.util.Date());

                    JOptionPane.showMessageDialog(bevitelMezoPanel, "Adatok rögzítve!");
                    
                    for (Component comp : components) {
                        comp.setBackground(Color.white);
                        comp.setForeground(Color.black);
                    }

                    String command = "INSERT INTO vendegek VALUES (";

                    int v = 1;
                    while (true){
                        rs = st.executeQuery(String.format("SELECT * FROM vendegek WHERE vendegid = %d", v));
                        if (!rs.next()){
                            command += v;
                            break;
                        }
                        v++;
                    }

                    for (int i = 0; i < adatok.size(); i++) {
                        switch (i) {
                            case 1 -> {
                                String telszam = adatok.get(i);
                                String formazottTelszam = "06";
                                for (int l = 2; l < telszam.length(); l++) {
                                    if (l == 2 || l == 4 || l == 7) {
                                        formazottTelszam += "-";
                                    }
                                    formazottTelszam += String.valueOf(telszam.charAt(l));
                                }
                                command += ", '" + formazottTelszam + "'";
                            }
                            case 3 -> {
                                command += ", " + adatok.get(i);
                            }
                            default -> {
                                command += ", '" + adatok.get(i) + "'";
                            }
                        }
                    }
                    command += ")";
                    st.execute(command);
                    
                } else {
                     ArrayList<String> hibasText = new ArrayList<>();
                    for (Component hibas : hibasComponent) {
                        hibas.setBackground(Color.red);
                        hibas.setForeground(Color.white);
                        hibasText.add(hibas.getName());
                    }
                   JLabel asd = new JLabel();
                   

                   String hibaText = "Hiányzó adatok: ";
                   for (String a : hibasText) {
                    hibaText += String.format("%s| ", a);
                   }
                   asd.setText(hibaText);

                    JOptionPane.showMessageDialog(bevitelMezoPanel, hibaText);
                    hibasComponent.clear();
                }
              
            } catch (SQLException f){
                System.out.println("Hiba: " + f.getMessage());
            }       
        });

        torles.addActionListener((ActionEvent e) -> {
            szovegPanel.removeAll();
            try {
                st.execute(String.format("DELETE FROM vendegek where vendegid = %s", torlesID.getText()));
            } catch (SQLException f) {
                System.out.println(f.getMessage());
            }
            torlesID.setText("");
            foglalasokKiiras.getFoglalasok();
            frame.repaint();
         });
        
    }

    public static void main(String[] args) throws SQLException, FontFormatException, IOException {
        try {
            conn = DriverManager.getConnection("jdbc:postgresql://pg.tamado.org:5432/Hotel", "postgres", "hungaryen");
            st = conn.createStatement();
            rs = st.executeQuery("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'vendegek'");

            while (rs.next()) {
                strVendegOszlopok = rs.getString(1);
            }

            rs = st.executeQuery("SELECT COUNT(*) FROM szobak");

            while (rs.next()) {
                iSzobaOszlopok = Integer.parseInt(rs.getString(1));
            }
            arrSzobak = new String[iSzobaOszlopok];

            rs = st.executeQuery("SELECT nev FROM szobak ORDER BY szobaid");

            for (int i = 0; i < iSzobaOszlopok && rs.next(); i++){
                arrSzobak[i] = rs.getString(1);
            }

            rs = st.executeQuery("SELECT table_name, column_name FROM information_schema.columns where table_name = 'vendegek'");
            rs.next();

            mezoNevek = new ArrayList<>();
            while (rs.next()) {
                mezoNevek.add(rs.getString(1)+"."+rs.getString(2));
            }
            rs = st.executeQuery("SELECT table_name, column_name FROM information_schema.columns where table_name = 'szobak'");
            rs.next();
            rs.next();
            mezoNevek.add(rs.getString(1)+"."+rs.getString(2));

            rs = st.executeQuery("SELECT bejelentkezes, kijelentkezes from vendegek");

            bejelentkezesek = new ArrayList<>();
            kijelentkezesek = new ArrayList<>();
            while (rs.next()) {
                bejelentkezesek.add(rs.getDate(1));
                kijelentkezesek.add(rs.getDate(2));
            }


        } catch (SQLException e) {
            System.out.println("Hiba: " + e.getMessage());
        }

        new gui().bevitel();
    }
}