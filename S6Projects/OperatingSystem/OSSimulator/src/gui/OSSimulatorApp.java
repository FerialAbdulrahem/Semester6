package gui;

import javafx.animation.*;
import javafx.application.*;
import javafx.geometry.*;
import javafx.scene.*;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.*;
import javafx.scene.shape.*;
import javafx.scene.text.*;
import javafx.stage.*;
import javafx.util.Duration;
import os.memory.Memory;
import os.memory.MemoryWord;
import os.processes.PCB;
import os.processes.Process;
import os.processes.ProcessState;
import os.syscalls.Mutex;
import scheduler.*;

import java.util.*;


public class OSSimulatorApp extends Application {

   
    private static final String BG_DARK   = "#f8f9fa";
    private static final String BG_PANEL  = "#ffffff";
    private static final String BG_CARD   = "#f1f3f5";
    private static final String ACCENT    = "#e03131";
    private static final String ACCENT2   = "#1971c2";
    private static final String GREEN     = "#2f9e44";
    private static final String YELLOW    = "#e67700";
    private static final String ORANGE    = "#d9480f";
    private static final String PURPLE    = "#6741d9";
    private static final String WHITE     = "#212529";
    private static final String MUTED     = "#868e96";
    private static final String BORDER    = "#ced4da";
   
    private static final String[] PROC_COLORS      = {"#e03131", "#1971c2", "#2f9e44", "#e67700"};
    private static final String[] PROC_COLORS_DARK = {"#c92a2a", "#155c9e", "#276e37", "#c85d00"};

 
    private SimulationEngine engine;

   
    private Label            clockLabel;
    private Label            statusLabel;
    private ComboBox<String> schedulerCombo;
    private ComboBox<String> quantumCombo;
    private Slider           speedSlider;
    private Button           btnStep, btnPlay, btnPause, btnReset;

   
    private Label[]     memoryCells = new Label[Memory.SIZE];
    private Rectangle[] memoryBars  = new Rectangle[Memory.SIZE];

  
    private VBox             runningCard;
    private VBox             readyQueueContainer;
    private VBox             blockedQueueContainer;
    private VBox             diskQueueContainer;     // processes swapped to disk
    private Label            mutexFileLabel, mutexInputLabel, mutexOutputLabel;
    private VBox             mutexFileWaiting, mutexInputWaiting, mutexOutputWaiting;

  
    private TextField inputField;
    private Button    btnSubmitInput;
    private HBox      inputRow;

 
    private TextArea consoleArea;
    private TextArea logArea;

    
    private Timeline autoPlay;
    private boolean  playing = false;
    private int      lastLogIndex = 0;

  
    @Override
    public void start(Stage stage) {
        engine = new SimulationEngine(this::onEngineOutput);

        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color:" + BG_DARK + ";");
        root.setTop(buildTopBar());
        root.setCenter(buildMainArea());
        root.setBottom(buildBottomBar());

        Scene scene = new Scene(root, 1500, 920);
        stage.setTitle("OS Simulator — GUC CSEN 602");
        stage.setScene(scene);
        stage.show();

        autoPlay = buildTimeline(600);
        refreshUI();
    }

    
    private Node buildTopBar() {
        HBox bar = new HBox(10);
        bar.setPadding(new Insets(10, 18, 10, 18));
        bar.setAlignment(Pos.CENTER_LEFT);
        bar.setStyle("-fx-background-color:" + BG_PANEL
                   + ";-fx-border-color:" + ACCENT
                   + ";-fx-border-width:0 0 2 0;");

        Label title = lbl("OS SIMULATOR", 17, WHITE, true);

        clockLabel = lbl("  Clock: 0", 15, ACCENT, true);
        clockLabel.setStyle("-fx-text-fill:" + ACCENT
                          + ";-fx-font-size:15;-fx-font-weight:bold;"
                          + "-fx-background-color:" + BG_CARD
                          + ";-fx-padding:4 10;-fx-background-radius:6;");

        schedulerCombo = new ComboBox<>();
        schedulerCombo.getItems().addAll("Round Robin", "HRRN", "MLFQ");
        schedulerCombo.setValue("Round Robin");
        styleCombo(schedulerCombo);

        quantumCombo = new ComboBox<>();
        quantumCombo.getItems().addAll("1","2","3","4","5","6","8");
        quantumCombo.setValue("2");
        styleCombo(quantumCombo);
        quantumCombo.setMaxWidth(70);
        quantumCombo.disableProperty().bind(
            schedulerCombo.valueProperty().isNotEqualTo("Round Robin"));

        schedulerCombo.setOnAction(e -> applyScheduler());
        quantumCombo.setOnAction(e -> applyScheduler());

        Label lbSpeed = lbl("Speed:", 12, MUTED, false);
        speedSlider = new Slider(100, 2000, 600);
        speedSlider.setPrefWidth(130);
        speedSlider.setOnMouseReleased(e -> rebuildTimeline());

        btnStep  = btn("Step",   ACCENT2);
        btnPlay  = btn("Play",   GREEN);
        btnPause = btn("Pause",  ORANGE);
        btnReset = btn("Reset",  ACCENT);
        btnStep .setOnAction(e -> doStep());
        btnPlay .setOnAction(e -> doPlay());
        btnPause.setOnAction(e -> doPause());
        btnReset.setOnAction(e -> doReset());

        statusLabel = lbl("Ready", 12, GREEN, false);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        bar.getChildren().addAll(
            title, clockLabel, sep(),
            lbl("Scheduler:", 12, MUTED, false), schedulerCombo,
            lbl("Quantum:", 12, MUTED, false), quantumCombo, sep(),
            lbSpeed, speedSlider, sep(),
            btnStep, btnPlay, btnPause, btnReset,
            spacer, statusLabel);
        return bar;
    }

    private Node buildMainArea() {
        HBox main = new HBox(6);
        main.setPadding(new Insets(6));

        VBox memPanel = buildMemoryPanel();
        memPanel.setPrefWidth(290);

        VBox queuePanel = buildQueuePanel();
        queuePanel.setPrefWidth(480);  // Wider to accommodate queues properly

        VBox consolePanel = buildConsolePanel();
        HBox.setHgrow(consolePanel, Priority.ALWAYS);

        main.getChildren().addAll(memPanel, queuePanel, consolePanel);
        return main;
    }

    private VBox buildMemoryPanel() {
        VBox panel = panel("MEMORY  (40 words)");

        ScrollPane scroll = new ScrollPane();
        scroll.setStyle("-fx-background:" + BG_DARK + ";-fx-background-color:" + BG_DARK + ";");
        scroll.setFitToWidth(true);

        GridPane grid = new GridPane();
        grid.setHgap(4); grid.setVgap(2);
        grid.setPadding(new Insets(4));

        for (int i = 0; i < Memory.SIZE; i++) {
            Label addr = lbl(String.format("[%02d]", i), 11, MUTED, false);
            addr.setMinWidth(32);

            memoryBars[i] = new Rectangle(12, 12);
            memoryBars[i].setArcWidth(3); memoryBars[i].setArcHeight(3);
            memoryBars[i].setFill(Color.web(BG_CARD));

            memoryCells[i] = lbl("FREE", 10, MUTED, false);
            memoryCells[i].setPrefWidth(205);
            memoryCells[i].setStyle("-fx-text-fill:" + MUTED
                    + ";-fx-font-size:10;-fx-font-family:monospace;");

            grid.add(addr,          0, i);
            grid.add(memoryBars[i], 1, i);
            grid.add(memoryCells[i],2, i);
        }
        scroll.setContent(grid);

        
        HBox legend = new HBox(10);
        legend.setPadding(new Insets(5, 6, 5, 6));
        legend.setAlignment(Pos.CENTER_LEFT);
        legend.setStyle("-fx-background-color:" + BG_CARD
                + ";-fx-border-color:" + BORDER
                + ";-fx-border-width:1;-fx-border-radius:4;-fx-background-radius:4;");
        String[] procNames = {"P1", "P2", "P3", "P4"};
        for (int p = 0; p < PROC_COLORS.length; p++) {
            Rectangle swatch = new Rectangle(12, 12);
            swatch.setArcWidth(3); swatch.setArcHeight(3);
            swatch.setFill(Color.web(PROC_COLORS[p]));
            Label name = lbl(procNames[p], 11, PROC_COLORS[p], true);
            HBox entry = new HBox(4, swatch, name);
            entry.setAlignment(Pos.CENTER_LEFT);
            legend.getChildren().add(entry);
        }
        Rectangle freeSwatch = new Rectangle(12, 12);
        freeSwatch.setArcWidth(3); freeSwatch.setArcHeight(3);
        freeSwatch.setFill(Color.web(BG_CARD));
        freeSwatch.setStroke(Color.web(BORDER));
        freeSwatch.setStrokeWidth(1);
        HBox freeEntry = new HBox(4, freeSwatch, lbl("FREE", 11, MUTED, false));
        freeEntry.setAlignment(Pos.CENTER_LEFT);
        legend.getChildren().add(freeEntry);

        panel.getChildren().addAll(legend, scroll);
        VBox.setVgrow(scroll, Priority.ALWAYS);
        return panel;
    }

private VBox buildQueuePanel() {
    VBox panel = panel("PROCESS STATE");

  
    Label lbRun = lbl("RUNNING", 12, GREEN, true);
    runningCard = new VBox(3);
    runningCard.setPadding(new Insets(8));
    runningCard.setMinHeight(60);
    runningCard.setStyle("-fx-background-color:" + BG_CARD
            + ";-fx-border-color:" + GREEN
            + ";-fx-border-width:2;-fx-border-radius:6;-fx-background-radius:6;");
    runningCard.getChildren().add(lbl("  idle", 13, MUTED, false));

    
    Label lbReady = lbl("READY QUEUE", 12, YELLOW, true);
    readyQueueContainer = new VBox(5);
    readyQueueContainer.setStyle("-fx-background-color:" + BG_CARD
            + ";-fx-border-color:" + BORDER
            + ";-fx-border-width:1;-fx-border-radius:6;-fx-background-radius:6;"
            + "-fx-padding:8;");
    readyQueueContainer.setMaxHeight(Region.USE_COMPUTED_SIZE);

  
    Label lbBlocked = lbl("BLOCKED QUEUE", 12, ORANGE, true);
    blockedQueueContainer = new VBox(5);
    blockedQueueContainer.setStyle("-fx-background-color:" + BG_CARD
            + ";-fx-border-color:" + BORDER
            + ";-fx-border-width:1;-fx-border-radius:6;-fx-background-radius:6;"
            + "-fx-padding:8;");
    blockedQueueContainer.setMaxHeight(Region.USE_COMPUTED_SIZE);

  
    Label lbDisk = lbl("ON DISK  (swapped out)", 12, PURPLE, true);
    diskQueueContainer = new VBox(5);
    diskQueueContainer.setStyle("-fx-background-color:" + BG_CARD
            + ";-fx-border-color:" + PURPLE
            + ";-fx-border-width:1;-fx-border-radius:6;-fx-background-radius:6;"
            + "-fx-padding:8;");
    diskQueueContainer.setMaxHeight(Region.USE_COMPUTED_SIZE);

   
    Label lbMutex = lbl("MUTEXES", 12, ACCENT, true);
    mutexFileLabel   = lbl("file:        FREE", 11, GREEN, false);
    mutexInputLabel  = lbl("userInput:   FREE", 11, GREEN, false);
    mutexOutputLabel = lbl("userOutput:  FREE", 11, GREEN, false);
    mutexFileWaiting   = new VBox(2);
    mutexInputWaiting  = new VBox(2);
    mutexOutputWaiting = new VBox(2);

    VBox mutexBox = new VBox(4);
    mutexBox.setPadding(new Insets(8));
    mutexBox.setStyle("-fx-background-color:" + BG_CARD
            + ";-fx-border-color:" + ACCENT
            + ";-fx-border-width:1;-fx-border-radius:6;-fx-background-radius:6;");
    mutexBox.getChildren().addAll(
            mutexFileLabel, mutexFileWaiting, new Separator(),
            mutexInputLabel, mutexInputWaiting, new Separator(),
            mutexOutputLabel, mutexOutputWaiting);

   
    Label lbArrivals = lbl("ARRIVAL TIMES", 12, ACCENT2, true);
    HBox arrBox = new HBox(12);
    arrBox.setPadding(new Insets(6));
    arrBox.setStyle("-fx-background-color:" + BG_CARD
            + ";-fx-border-color:" + ACCENT2
            + ";-fx-border-width:1;-fx-border-radius:6;-fx-background-radius:6;");
    arrBox.getChildren().addAll(
            lbl("P1 @ t=0", 11, PROC_COLORS[0], true),
            lbl("P2 @ t=1", 11, PROC_COLORS[1], true),
            lbl("P3 @ t=4", 11, PROC_COLORS[2], true));

   
    Label lbInput = lbl("USER INPUT", 12, ACCENT2, true);

    inputField = new TextField();
    inputField.setPromptText("Enter value here...");
    inputField.setStyle("-fx-background-color:#e8f4fd;-fx-text-fill:" + WHITE
            + ";-fx-font-size:13;"
            + "-fx-border-color:" + ACCENT2 + ";-fx-border-width:2;"
            + "-fx-border-radius:4;-fx-background-radius:4;");
    inputField.setOnAction(e -> submitInput());

    btnSubmitInput = btn("Submit", GREEN);
    btnSubmitInput.setOnAction(e -> submitInput());

    inputRow = new HBox(6, inputField, btnSubmitInput);
    HBox.setHgrow(inputField, Priority.ALWAYS);

    VBox inputSection = new VBox(4, lbInput, inputRow);
    inputSection.setVisible(false);
    inputSection.setManaged(false);
    inputRow.setUserData(inputSection);

 
    VBox scrollContent = new VBox(5);
    scrollContent.setPadding(new Insets(4));
    scrollContent.getChildren().addAll(
            lbRun, runningCard,
            new Separator(), lbReady, readyQueueContainer,
            new Separator(), lbBlocked, blockedQueueContainer,
            new Separator(), lbDisk, diskQueueContainer,
            new Separator(), lbMutex, mutexBox,
            new Separator(), lbArrivals, arrBox,
            new Separator(), inputSection);

    ScrollPane scroll = new ScrollPane(scrollContent);
    scroll.setFitToWidth(true);
    scroll.setStyle("-fx-background:" + BG_DARK + ";-fx-background-color:" + BG_DARK + ";");
    VBox.setVgrow(scroll, Priority.ALWAYS);

    panel.getChildren().add(scroll);
    return panel;
}
   
private Node createQueueDisplay(List<int[]> pids, boolean showResourceInfo, Map<Integer, String> blockedResources) {
    if (pids.isEmpty()) {
        Label emptyLabel = lbl("empty", 12, MUTED, false);
        emptyLabel.setPadding(new Insets(6, 0, 6, 0));
        return emptyLabel;
    }

    FlowPane queueFlow = new FlowPane();
    queueFlow.setHgap(8);
    queueFlow.setVgap(6);
    queueFlow.setAlignment(Pos.CENTER_LEFT);
    queueFlow.setPadding(new Insets(4));

    for (int i = 0; i < pids.size(); i++) {
        int pid = pids.get(i)[0];
        String bg   = (pid >= 1 && pid <= PROC_COLORS.length)      ? PROC_COLORS[pid - 1]      : ACCENT2;
        String dark = (pid >= 1 && pid <= PROC_COLORS_DARK.length)  ? PROC_COLORS_DARK[pid - 1] : ACCENT2;

        VBox cell = new VBox(2);
        cell.setAlignment(Pos.CENTER);
        cell.setMinWidth(48);
        cell.setStyle(
            "-fx-background-color: linear-gradient(to bottom, " + bg + ", " + dark + ");"
            + "-fx-background-radius:8;"
            + "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.15), 4, 0, 0, 1);"
            + "-fx-padding: 5 10;"
        );

        Label pl = new Label("P" + pid);
        pl.setStyle("-fx-text-fill:white;-fx-font-size:12;-fx-font-weight:bold;");
        cell.getChildren().add(pl);

        if (showResourceInfo && blockedResources != null && blockedResources.containsKey(pid)) {
            Label resLabel = new Label(blockedResources.get(pid));
            resLabel.setStyle("-fx-text-fill:rgba(255,255,255,0.85);-fx-font-size:8;");
            cell.getChildren().add(resLabel);
        }

        queueFlow.getChildren().add(cell);
    }

    return queueFlow;
}
    private VBox buildConsolePanel() {
        VBox panel = panel("CONSOLE OUTPUT  (print results, user input)");
        consoleArea = new TextArea();
        styleTA(consoleArea);
        panel.getChildren().add(consoleArea);
        VBox.setVgrow(consoleArea, Priority.ALWAYS);
        return panel;
    }

    private Node buildBottomBar() {
        VBox bar = new VBox(3);
        bar.setPadding(new Insets(5, 12, 6, 12));
        bar.setStyle("-fx-background-color:" + BG_PANEL
                + ";-fx-border-color:" + BORDER
                + ";-fx-border-width:2 0 0 0;");
        Label lbLog = lbl("EVENT LOG  (scheduling · memory · syscalls)", 11, MUTED, true);
        logArea = new TextArea();
        logArea.setPrefHeight(160);
        logArea.setEditable(false);
        styleTA(logArea);
        bar.getChildren().addAll(lbLog, logArea);
        return bar;
    }

    

    private void doStep() {
        if (engine.isFinished()) { setStatus("Simulation complete!", ACCENT); return; }
        engine.step();
        refreshUI();
        if (engine.isFinished()) {
            doPause();
            setStatus("All processes finished!", GREEN);
        }
    }

    private void doPlay() {
        if (engine.isFinished()) return;
        playing = true;
        btnPlay .setDisable(true);
        btnPause.setDisable(false);
        autoPlay.play();
        setStatus("Running...", GREEN);
    }

    private void doPause() {
        playing = false;
        autoPlay.stop();
        btnPlay .setDisable(false);
        btnPause.setDisable(true);
        setStatus("Paused", YELLOW);
    }

    private void doReset() {
        doPause();
        engine.reset();
        applyScheduler();
        consoleArea.clear();
        logArea.clear();
        lastLogIndex = 0;
        refreshUI();
        setStatus("Ready", GREEN);
    }

    private void applyScheduler() {
        String sel = schedulerCombo.getValue();
        scheduler sched;
        if ("HRRN".equals(sel)) {
            sched = new HRRNScheduler();
        } else if ("MLFQ".equals(sel)) {
            sched = new MLFQscheduler();
        } else {
            int q = 2;
            try { q = Integer.parseInt(quantumCombo.getValue()); } catch (Exception ignored) {}
            sched = new RoundRobinScheduler(q);
        }
        engine.setScheduler(sched);
    }

  
    private void submitInput() {
        String val = inputField.getText().trim();
        if (val.isEmpty()) return;

        engine.getSystemCall().provideInput(val);
        inputField.clear();
       
        VBox inputSection = (VBox) inputRow.getUserData();
        if (inputSection != null) {
            inputSection.setVisible(false);
            inputSection.setManaged(false);
        }

        appendConsole("INPUT> " + val);
        setStatus("Running...", GREEN);
        doStep();
    }

    

    private void refreshUI() {
        refreshClock();
        refreshMemory();
        refreshQueues();
        refreshDisk();
        refreshMutexes();
        refreshInputRow();
        appendNewLogs();
    }

    private void refreshClock() {
        clockLabel.setText("  Clock: " + engine.getClock());
    }

    private void refreshDisk() {
        diskQueueContainer.getChildren().clear();
        Set<Integer> onDisk = engine.getSwappedToDisk();
        if (onDisk.isEmpty()) {
            Label empty = lbl("empty", 12, MUTED, false);
            empty.setPadding(new Insets(6, 0, 6, 0));
            diskQueueContainer.getChildren().add(empty);
            return;
        }
        FlowPane flow = new FlowPane();
        flow.setHgap(8);
        flow.setVgap(6);
        flow.setAlignment(Pos.CENTER_LEFT);
        flow.setPadding(new Insets(4));

        for (int pid : onDisk) {
            String bg   = (pid >= 1 && pid <= PROC_COLORS.length)     ? PROC_COLORS[pid - 1]     : MUTED;
            String dark = (pid >= 1 && pid <= PROC_COLORS_DARK.length) ? PROC_COLORS_DARK[pid - 1]: MUTED;

            VBox cell = new VBox(2);
            cell.setAlignment(Pos.CENTER);
            cell.setMinWidth(58);
            cell.setStyle(
                "-fx-background-color: linear-gradient(to bottom, " + bg + ", " + dark + ");"
                + "-fx-background-radius:8;"
                + "-fx-border-color:" + PURPLE + ";-fx-border-width:2;-fx-border-radius:8;"
                + "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 4, 0, 0, 2);"
                + "-fx-padding: 5 10;"
            );

            Label pl = new Label("P" + pid);
            pl.setStyle("-fx-text-fill:white;-fx-font-size:12;-fx-font-weight:bold;");
            Label dl = new Label("on disk");
            dl.setStyle("-fx-text-fill:rgba(255,255,255,0.85);-fx-font-size:9;");

            // Show saved PC
            for (Process p : engine.getAllProcesses()) {
                if (p.getPCB().getProcessId() == pid) {
                    Label pcl = new Label("PC=" + p.getPCB().getProgramCounter());
                    pcl.setStyle("-fx-text-fill:rgba(255,255,255,0.75);-fx-font-size:9;");
                    cell.getChildren().addAll(pl, dl, pcl);
                    break;
                }
            }
            if (cell.getChildren().isEmpty()) cell.getChildren().addAll(pl, dl);

            flow.getChildren().add(cell);
        }
        diskQueueContainer.getChildren().add(flow);
    }

    private void refreshMemory() {
        Memory mem = engine.getMemory();
        MemoryWord[] words = mem.getMemory();

  
        Map<Integer, Integer> addrToPid = new HashMap<>();
        for (int i = 0; i < Memory.SIZE; i++) {
            if (words[i].isAllocated()) {
                String val = words[i].getValue();
                if (val != null && val.startsWith("PCB:PID=")) {
                    try {
                        int pid = Integer.parseInt(val.substring("PCB:PID=".length()).trim());
                        // Find the end of this process's block: read PCB:Mem= word (offset 3)
                        if (i + 3 < Memory.SIZE) {
                            String memWord = words[i + 3].getValue();
                            if (memWord != null && memWord.startsWith("PCB:Mem=[")) {
                                String range = memWord.substring("PCB:Mem=[".length(), memWord.length() - 1);
                                String[] parts = range.split("-");
                                int start = Integer.parseInt(parts[0]);
                                int end   = Integer.parseInt(parts[1]);
                                for (int a = start; a <= Math.min(end, Memory.SIZE - 1); a++) {
                                    addrToPid.put(a, pid);
                                }
                            }
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        for (int i = 0; i < Memory.SIZE; i++) {
            MemoryWord w = words[i];
            if (w.isAllocated()) {
                String raw = w.getValue() != null ? w.getValue() : "";
                String display = raw.length() > 28 ? raw.substring(0, 26) + "…" : raw;
                memoryCells[i].setText(display);
                Integer pid = addrToPid.get(i);
                String color = (pid != null && pid >= 1 && pid <= PROC_COLORS.length)
                        ? PROC_COLORS[pid - 1] : MUTED;
                memoryCells[i].setStyle("-fx-text-fill:" + WHITE
                        + ";-fx-font-size:10;-fx-font-family:monospace;"
                        + "-fx-background-color:derive(" + color + ",80%);"
                        + "-fx-padding:0 2;");
                memoryBars[i].setFill(Color.web(color));
            } else {
                memoryCells[i].setText("FREE");
                memoryCells[i].setStyle("-fx-text-fill:" + MUTED
                        + ";-fx-font-size:10;-fx-font-family:monospace;-fx-padding:0 2;");
                memoryBars[i].setFill(Color.web(BG_CARD));
            }
        }
    }

private void refreshQueues() {
   
    runningCard.getChildren().clear();
    Process running = engine.getRunningProcess();

    if (running != null) {
        PCB pcb = running.getPCB();
        int pid = pcb.getProcessId();
        String procColor = (pid >= 1 && pid <= PROC_COLORS.length) ? PROC_COLORS[pid - 1] : ACCENT2;
        runningCard.setStyle("-fx-background-color:derive(" + procColor + ",75%);"
                + "-fx-border-color:" + procColor
                + ";-fx-border-width:2;-fx-border-radius:6;-fx-background-radius:6;");
        Label pidLabel = lbl("P" + pid + "   PC=" + pcb.getProgramCounter(), 13, procColor, true);
        Label remLabel = lbl("Remaining: " + pcb.getRemainingTime(), 11, WHITE, false);
        runningCard.getChildren().addAll(pidLabel, remLabel);
    } else {
        runningCard.setStyle("-fx-background-color:" + BG_CARD
                + ";-fx-border-color:" + GREEN
                + ";-fx-border-width:2;-fx-border-radius:6;-fx-background-radius:6;");
        runningCard.getChildren().add(lbl("idle", 13, MUTED, false));
    }

    
    readyQueueContainer.getChildren().clear();
    scheduler sched = engine.getScheduler();

    if (sched instanceof MLFQscheduler) {
        MLFQscheduler mlfq = (MLFQscheduler) sched;
        VBox levelsBox = new VBox(8);
        levelsBox.setPadding(new Insets(4));

        List<Queue<Process>> queues = mlfq.getQueues();

        for (int i = 0; i < 4; i++) {
            VBox levelPanel = new VBox(4);
            levelPanel.setStyle("-fx-background-color:" + BG_PANEL + ";-fx-border-color:" + BORDER + ";-fx-border-width:1;-fx-border-radius:4;-fx-background-radius:4;-fx-padding:6;");

            String color;
            if (i == 0) color = "#7ad9f0";
            else if (i == 1) color = "#84d87b";
            else if (i == 2) color = "#ffa569";
            else color ="#ff8484";

            int quantum = (int) Math.pow(2, i);

            Label levelLabel = new Label("Queue " + i + " (q=" + quantum + ")");
            levelLabel.setStyle(
                "-fx-background-color:" + color + ";" +
                "-fx-text-fill:white;" + "-fx-padding:2 8;" +
                "-fx-background-radius:12;" +
                "-fx-font-size:11;" +
                "-fx-font-weight:bold;"
            );

            List<int[]> pids = new ArrayList<>();
            if (i < queues.size()) {
                for (Process p : queues.get(i)) {
                    pids.add(new int[]{p.getPCB().getProcessId()});
                }
            }

            Node queueDisplay = createQueueDisplay(pids, false, null);
            levelPanel.getChildren().addAll(levelLabel, queueDisplay);
            levelsBox.getChildren().add(levelPanel);
        }

        readyQueueContainer.getChildren().add(levelsBox);
    } else {
      
        List<int[]> pids = new ArrayList<>();
        for (Process p : engine.getReadyQueue()) {
            pids.add(new int[]{p.getPCB().getProcessId()});
        }
        Node queueDisplay = createQueueDisplay(pids, false, null);
        readyQueueContainer.getChildren().add(queueDisplay);
    }

    
    blockedQueueContainer.getChildren().clear();
    Map<Integer, String> blockedResources = new HashMap<>();
    List<int[]> blockedPids = new ArrayList<>();
    
    for (Process p : engine.getBlockedQueue()) {
        int pid = p.getPCB().getProcessId();
        blockedPids.add(new int[]{pid});
        
        // Determine which resource this process is blocked on
        if (engine.getFileMutex() != null && engine.getFileMutex().getWaitingQueue().contains(p)) {
            blockedResources.put(pid, "file");
        } else if (engine.getUserInputMutex() != null && engine.getUserInputMutex().getWaitingQueue().contains(p)) {
            blockedResources.put(pid, "userInput");
        } else if (engine.getUserOutputMutex() != null && engine.getUserOutputMutex().getWaitingQueue().contains(p)) {
            blockedResources.put(pid, "userOutput");
        } else {
            blockedResources.put(pid, "resource");
        }
    }
    
    Node blockedDisplay = createQueueDisplay(blockedPids, true, blockedResources);
    blockedQueueContainer.getChildren().add(blockedDisplay);
}
    private void refreshMutexes() {
        updateMutexLabel(mutexFileLabel,   mutexFileWaiting,   engine.getFileMutex(),       "file");
        updateMutexLabel(mutexInputLabel,  mutexInputWaiting,  engine.getUserInputMutex(),  "userInput");
        updateMutexLabel(mutexOutputLabel, mutexOutputWaiting, engine.getUserOutputMutex(), "userOutput");
    }

    private void updateMutexLabel(Label label, VBox waitBox, Mutex mutex, String name) {
        if (mutex.isLocked()) {
            Process owner = mutex.getOwner();
            String o = owner != null ? "P" + owner.getPCB().getProcessId() : "?";
            label.setText(name + ":  LOCKED by " + o);
            label.setStyle("-fx-text-fill:" + ACCENT + ";-fx-font-size:11;");
        } else {
            label.setText(name + ":  FREE");
            label.setStyle("-fx-text-fill:" + GREEN + ";-fx-font-size:11;");
        }
        waitBox.getChildren().clear();
        for (Process p : mutex.getWaitingQueue()) {
            waitBox.getChildren().add(
                lbl("      waiting: P" + p.getPCB().getProcessId(), 10, ORANGE, false));
        }
    }

   
    private void refreshInputRow() {
        boolean waiting = engine.isAwaitingInput();
        Platform.runLater(() -> {
            // inputRow.getUserData() holds the parent VBox (inputSection)
            VBox inputSection = (VBox) inputRow.getUserData();
            if (inputSection != null) {
                inputSection.setVisible(waiting);
                inputSection.setManaged(waiting);
            }
            if (waiting) {
                doPause();
                setStatus("Waiting for user input...", ACCENT2);
                Platform.runLater(() -> inputField.requestFocus());
            }
        });
    }

   
    private void onEngineOutput(String msg) {
        // Route screen output to the console panel immediately
        if (msg != null && (msg.startsWith("[SCREEN]") || msg.startsWith("[INPUT]"))) {
            String display = msg.startsWith("[SCREEN]")
                    ? "OUTPUT> " + msg.substring("[SCREEN]".length()).trim()
                    : "PROMPT> " + msg.substring("[INPUT]".length()).trim();
            appendConsole(display);
        }
       
    }

    private void appendNewLogs() {
        List<String> log = engine.getEventLog();
        StringBuilder sb = new StringBuilder();
        while (lastLogIndex < log.size()) {
            sb.append(log.get(lastLogIndex++)).append("\n");
        }
        if (sb.length() > 0) {
            String text = sb.toString();
            Platform.runLater(() -> logArea.appendText(text));
        }
    }

    private void appendConsole(String msg) {
        Platform.runLater(() -> consoleArea.appendText(msg + "\n"));
    }

   

    private Timeline buildTimeline(double ms) {
        Timeline t = new Timeline(new KeyFrame(Duration.millis(ms), e -> doStep()));
        t.setCycleCount(Animation.INDEFINITE);
        return t;
    }

    private void rebuildTimeline() {
        boolean wasPlaying = playing;
        autoPlay.stop();
        double ms = 2100 - speedSlider.getValue();
        autoPlay = buildTimeline(ms);
        if (wasPlaying) autoPlay.play();
    }

  

    private VBox panel(String title) {
        VBox box = new VBox(5);
        box.setPadding(new Insets(8));
        box.setStyle("-fx-background-color:" + BG_PANEL
                + ";-fx-border-color:" + BORDER
                + ";-fx-border-width:1;-fx-border-radius:8;-fx-background-radius:8;");
        Label t = lbl(title, 12, ACCENT, true);
        t.setPadding(new Insets(0, 0, 4, 0));
        box.getChildren().add(t);
        return box;
    }

    private Label lbl(String text, int size, String color, boolean bold) {
        Label l = new Label(text);
        String s = "-fx-text-fill:" + color + ";-fx-font-size:" + size + ";";
        if (bold) s += "-fx-font-weight:bold;";
        l.setStyle(s);
        return l;
    }

    private Button btn(String text, String color) {
        Button b = new Button(text);
        b.setStyle("-fx-background-color:" + color
                + ";-fx-text-fill:white;-fx-font-size:12;-fx-font-weight:bold;"
                + "-fx-background-radius:6;-fx-cursor:hand;-fx-padding:5 12;");
        b.setOnMouseEntered(e -> b.setOpacity(0.82));
        b.setOnMouseExited (e -> b.setOpacity(1.0));
        return b;
    }

    private void styleCombo(ComboBox<String> c) {
        c.setStyle("-fx-background-color:" + BG_CARD
                + ";-fx-text-fill:" + WHITE + ";-fx-font-size:12;"
                + "-fx-border-color:" + BORDER + ";-fx-border-radius:4;");
    }

    private void styleTA(TextArea ta) {
        ta.setEditable(false);
        ta.setWrapText(false);
        ta.setStyle("-fx-control-inner-background:" + BG_DARK
                + ";-fx-text-fill:" + WHITE
                + ";-fx-font-family:monospace;-fx-font-size:12;"
                + "-fx-background-color:" + BG_DARK + ";");
    }

    private Separator sep() {
        Separator s = new Separator(Orientation.VERTICAL);
        s.setStyle("-fx-background-color:" + BORDER + ";");
        return s;
    }

    private void setStatus(String msg, String color) {
        statusLabel.setText(msg);
        statusLabel.setStyle("-fx-text-fill:" + color + ";-fx-font-size:12;");
    }

    public static void main(String[] args) { launch(args); }
}